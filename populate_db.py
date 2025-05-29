import lib.library as lib
import psycopg2
from psycopg2 import sql, extras

DB_SECRET_PATH = 'secret/data/postgres'
TABLE_NAME = "updated_data"
vault = lib.Vault()
db_user, db_pass = vault.get_secret(DB_SECRET_PATH)

DB_CONFIG = {
    "dbname": "postgres",
    "user": db_user,
    "password": db_pass,
    "host": "192.168.68.86",
    "port": 32262
}

def connect_db():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

def get_restaurants_data(bbox):

    db_conn = connect_db()
    bbox_str = ', '.join([str(x) for x in bbox])
    SQL_QUERY = f"""
    SELECT name
    FROM planet_osm_point
    WHERE amenity IS NOT NULL
        AND way && ST_Transform(
        ST_MakeEnvelope({bbox_str}, 4326), 3857
        )
        AND name is NOT NULL;
    """
    cursor = db_conn.cursor()
    cursor.execute(SQL_QUERY)
    results = cursor.fetchall()
    cursor.close()
    return results


def create_table():

    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                state_abbr VARCHAR(255),
                state VARCHAR(255),
                county VARCHAR(255),
                life_expectancy VARCHAR(50),
                med_income INTEGER,
                population INTEGER,
                pov_all INTEGER,
                pov_percent VARCHAR(255),
                urcc VARCHAR(10),
                uic VARCHAR(10),
                restaurant_all INTEGER,
                fast_food_all INTEGER,
                fast_food_percent VARCHAR(10),
                missing_rest_data BOOLEAN
            );
        """)
        conn.commit()
        print("us_data table created")
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        cursor.close()
        conn.close()

def insert_data(data):
    
    conn = connect_db()
    cursor = conn.cursor()
    try:
        columns = data[0].keys()
        values = [tuple(item[col] for col in columns) for item in data]
        print(values)

        # insert_query = sql.SQL("""
        #     INSERT INTO us_food ({})
        #     VALUES %s
        # """).format(sql.SQL(', ').join(map(sql.Identifier, columns)))
        insert_query = sql.SQL("""
            INSERT INTO {table} ({fields})
            VALUES %s
        """).format(
            table=sql.Identifier(TABLE_NAME),
            fields=sql.SQL(', ').join(map(sql.Identifier, columns))
        )
        extras.execute_values(cursor, insert_query, values)
        conn.commit()
        print(f"Inserted {cursor.rowcount}")
    except Exception as e:
        print(f"Error inserting values: {e}")
    finally:
        cursor.close()
        conn.close()

# def add_to_dict(data_list, state_abbr, state, county, life_expectancy, med_income, population, pov_all, pov_percent, urcc, uic, restaurant_all, fast_food_all):
#     #Compute Fast Food Pecentage
#     restaurant_all = None if restaurant_all == 'NULL' else int(restaurant_all)
#     fast_food_all = None if fast_food_all == 'NULL' else int(fast_food_all)
#     if restaurant_all is not None and fast_food_all is not None:
#         fast_food_percent = (fast_food_all / restaurant_all) * 100 if restaurant_all else 0
#     else:
#         fast_food_percent = None
#     print(fast_food_percent)

#     #Create data dictionary
#     data = {
#         "state_abbr": state_abbr,
#         "state": state,
#         "county": county,
#         "life_expectancy": f"{life_expectancy:.2f}",
#         "med_income": med_income,
#         "population": population,
#         "pov_all": pov_all,
#         "pov_percent": pov_percent,
#         "urcc": urcc,
#         "uic": uic,
#         "restaurant_all": restaurant_all,
#         "fast_food_all": fast_food_all,
#         "fast_food_percent": 'NULL' if fast_food_percent is None else f"{fast_food_percent:.2f}"
#     }
#     data_list.append(data)
    
#     return data_list

def add_to_dict(data_list, state_abbr, state, county, life_expectancy, med_income, population, pov_all, pov_percent, urcc, uic, restaurant_all, fast_food_all, missing_rest_data):
    # Convert 'NULL' strings to None
    restaurant_all = None if str(restaurant_all).strip().upper() == 'NULL' else int(restaurant_all)
    fast_food_all = None if str(fast_food_all).strip().upper() == 'NULL' else int(fast_food_all)

    # Compute Fast Food Percentage
    if restaurant_all is not None and fast_food_all is not None:
        fast_food_percent = (fast_food_all / restaurant_all) * 100 if restaurant_all else 0
    else:
        fast_food_percent = None

    # Create data dictionary
    data = {
        "state_abbr":state_abbr,
        "state":state,
        "county":county,
        "life_expectancy":f"{float(life_expectancy):.2f}",  # Ensure it's a float
        "med_income":med_income,
        "population":population,
        "pov_all":pov_all,
        "pov_percent":pov_percent,
        "urcc":urcc,
        "uic":uic,
        "restaurant_all":restaurant_all,
        "fast_food_all":fast_food_all,
        "fast_food_percent":'NULL' if fast_food_percent is None else f"{float(fast_food_percent):.2f}",
        "missing_rest_data":missing_rest_data
    }
    data_list.append(data)

    return data_list


def populate_data():
    data = lib.loadDataFiles()
    suppData = lib.getData()
    states = suppData.get_states()
    data_list = []
    #US-LEVEL-DATA
    data_list = add_to_dict(data_list, 'US', 'US', 'NULL', '77.5', data.get_us_econ_data().get('MEDHHINC_2023'),data.get_us_pop_data().get('POP_ESTIMATE_2023'),data.get_us_econ_data().get('POVALL_2023'),data.get_us_econ_data().get('PCTPOVALL_2023'),'NULL','NULL','NULL','NULL', missing_rest_data=False)
    #STATE-LEVEL-DATA
    for state in states:
        print(f"Processing state -- -- {state}")
        counties = suppData.get_counties(state)
        state_abbr = suppData.get_state_abbr(state)
        state_bbox = suppData.get_state_bbox(state_abbr)
        state_restaurant_data = get_restaurants_data(state_bbox)
        state_fast_food = []
        for restaurant in state_restaurant_data:
            if suppData.is_fast_food(restaurant[0]):
                state_fast_food.append(restaurant[0])
        state_le = suppData.get_state_life_expectancy(state)
        county = 'NULL'
        med_income = data.get_state_econ_data(state_abbr).get('MEDHHINC_2023')
        population = data.get_state_pop_data(state_abbr).get('POP_ESTIMATE_2023')
        pov_all = data.get_state_econ_data(state_abbr).get('POVALL_2023')
        pov_percent = data.get_state_econ_data(state_abbr).get('PCTPOVALL_2023')
        urcc = 'NULL'
        uic = 'NULL'
        restaurant_all = len(state_restaurant_data)
        fast_food_all = len(state_fast_food)
        missing_rest_data = False
        data_list = add_to_dict(data_list, state_abbr, state, county, state_le, med_income, population, pov_all, pov_percent, urcc, uic, restaurant_all, fast_food_all, missing_rest_data)
        #COUNTY-LEVEL-DATA
        for _county in counties:
            print(f"Processing County -- {_county}")
            county_bbox = suppData.get_county_bbox(_county, state_abbr)
            try:
                county_restaurant_data = get_restaurants_data(county_bbox)
                county_fast_food = []
                for restaurant in county_restaurant_data:
                    if suppData.is_fast_food(restaurant[0]):
                        county_fast_food.append(restaurant[0])
                restaurant_all = len(county_restaurant_data)
                fast_food_all = len(county_fast_food)
                missing_rest_data = False
            except:
                missing_rest_data = True
                restaurant_all = 'NULL'
                fast_food_all = 'NULL'
            county_le = suppData.get_life_expectancy(_county, state)
            county = _county
            med_income = data.get_county_econ_data(state_abbr, _county).get('MEDHHINC_2023')
            population = data.get_county_pop_data(state_abbr, _county).get('POP_ESTIMATE_2023')
            pov_all = data.get_county_econ_data(state_abbr, _county).get('POVALL_2023')
            pov_percent = data.get_county_econ_data(state_abbr, _county).get('PCTPOVALL_2023')
            urcc = data.get_county_econ_data(state_abbr, _county).get('Rural_Urban_Continuum_Code_2023')
            uic = data.get_county_econ_data(state_abbr, _county).get('Urban_Influence_Code_2024')
                
            data_list = add_to_dict(data_list, state_abbr, state, county, county_le, med_income, population, pov_all, pov_percent, urcc, uic, restaurant_all, fast_food_all, missing_rest_data)
    
    return data_list


def test():
    suppData = lib.getData()
    counties = suppData.get_counties('Tennessee')
    print(counties)

def main():
    # test()

    create_table()

    data = populate_data()

    insert_data(data)

if __name__ == "__main__":
    main()