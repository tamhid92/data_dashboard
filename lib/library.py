
from lib.hvac_lib import HVACClient
import pandas as pd
import psycopg2
import csv
import ast

class Vault:
    def __init__(self):
        pass
    def get_secret(self, path):
        client = HVACClient()
        creds = client.read(path)
        for k,v in creds.items():
            user = k
            pwd = v
        return user, pwd

class loadDataFiles:
    def __init__(self, econ_data='data/econ_data.csv', pop_data='data/pop_data.csv'):
        df = pd.read_csv(econ_data, skiprows=1, header=None, names=["FIPS_Code", "Stabr", "Area_Name", "Attribute", "Value"])        
        #Load econ data into memory for faster lookups
        self.us_econ_data = {}
        self.state_econ_data = {}
        self.county_econ_data = {}

        for (fips, state, name), group in df.groupby(["FIPS_Code", "Stabr", "Area_Name"]):
            data_dict = {row["Attribute"]: row["Value"] for _, row in group.iterrows()}
            if str(fips) == "0":
                self.us_econ_data = data_dict
            elif str(fips).endswith("000"):
                self.state_econ_data[state] = data_dict
            else:
                self.county_econ_data[(state, name)] = data_dict
        
        #Load population data
        df1 = pd.read_csv(pop_data, skiprows=1, header=None, names=["FIPStxt", "State", "Area_Name", "Attribute", "Value"], encoding='latin-1')
        self.us_pop_data = {}
        self.state_pop_data = {}
        self.county_pop_data = {}

        for (fips, state, name), group in df1.groupby(["FIPStxt", "State", "Area_Name"]):
            data_dict = {row["Attribute"]: row["Value"] for _, row in group.iterrows()}
            if str(fips) == "0":
                self.us_pop_data = data_dict
            elif str(fips).endswith("000"):
                self.state_pop_data[state] = data_dict
            else:
                self.county_pop_data[(state, name)] = data_dict

    def get_us_econ_data(self):
        return self.us_econ_data

    def get_state_econ_data(self, state_abbr):
        return self.state_econ_data.get(state_abbr, {})

    def get_county_econ_data(self, state_abbr, county_name):
        return self.county_econ_data.get((state_abbr, county_name), {})
    
    #Get Population Data

    def get_us_pop_data(self):
        return self.us_pop_data

    def get_state_pop_data(self, state_abbr):
        return self.state_pop_data.get(state_abbr, {})

    def get_county_pop_data(self, state_abbr, county_name):
        return self.county_pop_data.get((state_abbr, county_name), {})    
    

class getData:
    def __init__(self):
        pass
    def get_counties(self, state):
        counties = []
        with open('data/fips.csv') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['state'] == state:
                    counties.append(row['NAME'])
            return counties
    def get_states(self):
        states = []
        with open("data/states.csv", newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                states.append(row["State"])
        return states
    def get_life_expectancy(self, county, state):
        df = pd.read_csv('data/le.csv')
        _state = self.get_state_abbr(state)
        filtered_df = df[df['County'].str.contains(f"{county}, {_state}")]
        return filtered_df['Life Expectancy'].mean()
    def get_state_life_expectancy(self, state):
        df = pd.read_csv('data/le.csv')
        filtered_df = df[df['State'].str.contains(f"{state}")]
        return filtered_df['Life Expectancy'].mean()
    def get_state_abbr(self, state):
        with open('data/states.csv') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['State'] == state:
                    return row['Abbreviation']
    def get_state_name(self, state_abbr):
        with open('data/states.csv', 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            state_abbr_map = {row['Abbreviation']: row['State'] for row in reader}
        return state_abbr_map.get(state_abbr, None)
    def get_county_bbox(self, county, state_abbr):
        with open('data/county_bbox.csv', 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['county'] == f"{county}, {state_abbr}":
                    return ast.literal_eval(row['bbox'])
        return None
    def get_state_bbox(self, state):
        with open('data/state_bbox.csv', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['state'] == state:
                    raw_bbox = row['bbox']
                    try:
                        parsed = ast.literal_eval(raw_bbox)
                        if isinstance(parsed, float):
                            print(f"Malformed bbox for {state}: {raw_bbox}")
                            return None
                        return parsed
                    except Exception as e:
                        print(f"Failed to parse bbox for {state}: {e}")
                        return None
    def is_fast_food(self, name):
        fast_food_names = ["McDonald's", "Burger King", "KFC", "Subway", "Pizza Hut", "Domino's", "Taco Bell", "Wendy's", "Dunkin'", "Starbucks", "Sonic", "Panda Express", "Popeyes", "Jack in the Box", "Arby's", "Carl's Jr.", "Hardee's", "Little Caesars", "Wingstop", "Krystal"]
        if name in fast_food_names:
            return True
        else:
            return False
