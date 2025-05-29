import psycopg2
from flask import Flask, jsonify
from lib.hvac_lib import HVACClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

TABLE_NAME = "updated_data"

def get_secret():
    client = HVACClient()
    creds = client.read('secret/data/postgres')
    for k,v in creds.items():
        uname = k
        pwd = v
    return uname, pwd

def db_connect():
    try:
        db_user, db_pass = get_secret()
        conn = psycopg2.connect(
            host="192.168.68.86",
            port=32262,
            database="postgres",
            user=db_user,
            password=db_pass
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        return None

@app.route("/api/", methods=["GET"])
def hello():
    return jsonify("Data API")

@app.route("/api/all", methods=["GET"])
def get_all_data():
    conn = db_connect()
    cur = conn.cursor()

    SQL_QUERY = f'''
        SELECT * from {TABLE_NAME}
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    column_names = [desc[0] for desc in cur.description]

    results = []
    for row in rows:
        results.append(dict(zip(column_names, row)))
    
    cur.close()
    conn.close()

    return jsonify(results)

@app.route("/api/us/states/", methods=["GET"])
def get_all_states():
    conn = db_connect()
    cur = conn.cursor()

    SQL_QUERY = f'''
        SELECT DISTINCT state, state_abbr from {TABLE_NAME}
        ORDER BY state
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    results = []
    for row in rows:
        results.append({'state_abbr': row[1], 'state': row[0]})
    
    cur.close()
    conn.close()

    return jsonify(results)

@app.route("/api/us/states/<string:state>/", methods=["GET"])
def get_state_data(state):
    conn = db_connect()
    cur = conn.cursor()

    if state == 'all':
        SQL_QUERY = f'''
            SELECT * from {TABLE_NAME}
            WHERE county = 'NULL'
        '''
    else:
        SQL_QUERY = f'''
        SELECT * from {TABLE_NAME}
        WHERE state_abbr = '{state.upper()}'
        AND county = 'NULL'
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    column_names = [desc[0] for desc in cur.description]

    results = []
    for row in rows:
        results.append(dict(zip(column_names, row)))
    
    cur.close()
    conn.close()

    return jsonify(results)

@app.route("/api/us/states/<string:state>/county/", methods=["GET"])
def get_county_data(state):
    conn = db_connect()
    cur = conn.cursor()

    SQL_QUERY = f'''
        SELECT * from {TABLE_NAME}
        WHERE state_abbr = '{state.upper()}'
        AND county != 'NULL'
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    column_names = [desc[0] for desc in cur.description]

    results = []
    for row in rows:
        results.append(dict(zip(column_names, row)))
    
    cur.close()
    conn.close()

    return jsonify(results)

@app.route("/api/us/", methods=["GET"])
def get_national_data():
    conn = db_connect()
    cur = conn.cursor()

    SQL_QUERY = f'''
        SELECT * from {TABLE_NAME}
        WHERE state_abbr = 'US'
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    column_names = [desc[0] for desc in cur.description]

    results = []
    for row in rows:
        results.append(dict(zip(column_names, row)))
    
    cur.close()
    conn.close()

    return jsonify(results)


def test():
    conn = db_connect()
    cur = conn.cursor()

    SQL_QUERY = f'''
        SELECT DISTINCT state from {TABLE_NAME}
    '''

    cur.execute(SQL_QUERY)
    rows = cur.fetchall()

    results = []
    for row in rows:
        results.append(row[0])
    
    cur.close()
    conn.close()


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=50000)
    # test()