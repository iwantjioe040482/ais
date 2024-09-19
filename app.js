const express = require('express');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the host or default to 3000

// Set up the MySQL connection
const dbConfig = {
    host: 'localhost',
    port: '3306',
    user: 'dba',
    password: 'Welcome123',
    database: 'ais'
  };
  const createConnection = () => mysql.createConnection(dbConfig);
 
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

 // Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// In-memory data store (replace with a database in production)
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

// Middleware to parse JSON requests
app.use(express.json());

app.get('/assets', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select a.asset_id as id,a.asset_name,t.type_asset,u.name,a.est_value,(select DATE_FORMAT(tr.time_stamp, "%Y-%m-%d %H:%i:%s") AS time_stamp from tr_asset_history tr  where tr.asset_id=a.asset_id order by tr.time_stamp desc limit 1) as last_update, ' +
          '(select l.location_name from tr_asset_history tr inner join mst_location l on l.location_id=tr.location_id where tr.asset_id=a.asset_id order by tr.time_stamp desc limit 1) as last_location from ais.mst_asset a ' +
          'inner join mst_user u on u.user_id =a.user_id ' +
          'inner join mst_type_asset t on t.type_id =a.type_id  order by a.est_value desc';
  
      // execute the insert statmentßß
      connection.query(sql,  (err, results, fields) => {
        if (err) 
        {
          res.status(500).json({ error: 'Failed to execute query' });
          return console.error(err.message);
        }
      
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();

        res.json(results);
      });
    
  });

});

app.get('/creditcard', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline from ais.recurring r where r.type_id ="2"';
  
      // execute the insert statmentßß
      connection.query(sql,  (err, results, fields) => {
        if (err) 
        {
          res.status(500).json({ error: 'Failed to execute query' });
          return console.error(err.message);
        }
      
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();

        res.json(results);
      });
    
  });

});

app.get('/insurance', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline from ais.recurring r where r.type_id ="1"';
  
      // execute the insert statmentßß
      connection.query(sql,  (err, results, fields) => {
        if (err) 
        {
          res.status(500).json({ error: 'Failed to execute query' });
          return console.error(err.message);
        }
      
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();

        res.json(results);
      });
    
  });

});

app.post('/water', (req, res) => {
  const newWater = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newWater === 'string') {
        try {
          water = JSON.parse(newWater);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
      water = newWater;
    }

    // insert statment
    let sql = 'INSERT INTO ais.water (date,water_value) VALUES (?,?)';
    let values = [water.date,water.water_value];

    // execute the insert statment
    connection.query(sql, values, (err, results, fields) => {
      if (err) 
      {
        res.status(500).json({ error: 'Failed to execute query' });
        return console.error(err.message);
      }
  
      console.log(`Inserted Rows: ${results.affectedRows}`);
      // close the database connection
      connection.end();
      res.status(201).json(newWater);
    });
  
  
  });

});


app.get('/water', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select id,DATE_FORMAT(date, "%Y-%m-%d") AS date,water_value from  water';
  
      // execute the insert statment
      connection.query(sql,  (err, results, fields) => {
        if (err) 
        {
          res.status(500).json({ error: 'Failed to execute query' });
          return console.error(err.message);
        }
      
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();

        res.json(results);
      });
    
  });

});


app.post('/electricity', (req, res) => {
  const newElectricity = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newElectricity === 'string') {
        try {
          electricity = JSON.parse(newElectricity);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
      electricity = newElectricity;
    }

    // insert statment
    let sql = 'INSERT INTO ais.electricity (date,electricity_value) VALUES (?,?)';
    let values = [electricity.date,electricity.electricity_value];

    // execute the insert statment
    connection.query(sql, values, (err, results, fields) => {
      if (err) 
      {
        res.status(500).json({ error: 'Failed to execute query' });
        return console.error(err.message);
      }
  
      console.log(`Inserted Rows: ${results.affectedRows}`);
      // close the database connection
      connection.end();
      res.status(201).json(newElectricity);
    });
  
  
  });

});

// Read (GET) all items
app.get('/electricity', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select id,DATE_FORMAT(date, "%Y-%m-%d") AS date,electricity_value from  electricity';
  
      // execute the insert statment
      connection.query(sql,  (err, results, fields) => {
        if (err) 
        {
          res.status(500).json({ error: 'Failed to execute query' });
          return console.error(err.message);
        }
      
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();

        res.json(results);
      });
    
  });

});



// Create (POST) a new item
app.post('/items', (req, res) => {
  const newItem = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newItem === 'string') {
        try {
            item = JSON.parse(newItem);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
        item = newItem;
    }

    // insert statment
    let sql = 'INSERT INTO items (name) VALUES (?)';
    let values = [item.name];

    // execute the insert statment
    connection.query(sql, values, (err, results, fields) => {
      if (err) 
      {
        res.status(500).json({ error: 'Failed to execute query' });
        return console.error(err.message);
      }
  
      console.log(`Inserted Rows: ${results.affectedRows}`);
      // close the database connection
      connection.end();
      res.status(201).json(newItem);
    });
  
  
  });

});

// Read (GET) all items
app.get('/items', (req, res) => {

    const connection = createConnection();

    connection.connect((err) => {
        if (err) 
        {
            res.status(500).json({ error: 'Failed to connect to the database' });
            return console.error(err.message);
        }
      
        // insert statment
        let sql = 'select * from  items';
    
        // execute the insert statment
        connection.query(sql,  (err, results, fields) => {
          if (err) 
          {
            res.status(500).json({ error: 'Failed to execute query' });
            return console.error(err.message);
          }
        
          // Convert the query results to JSON
          const jsonResult = JSON.stringify(results);
          console.log(jsonResult);          

          // close the database connection
          connection.end();

          res.json(results);
        });
      
    });

});

// Read (GET) a specific item by ID
app.get('/items/:id', (req, res) => {

    const connection = createConnection();
    const id = parseInt(req.params.id);

    connection.connect((err) => {
        if (err) 
        {
            res.status(500).json({ error: 'Failed to connect to the database' });
            return console.error(err.message);
        }
      
        // insert statment
        let sql = 'select * from  items where id=?';

        // execute the insert statment
        connection.query(sql, id, (err, results, fields) => {
          if (err) 
          {
            res.status(404).json({ error: 'Item not found' });
            return console.error(err.message);
          }
        
          // Convert the query results to JSON
          const jsonResult = JSON.stringify(results);
          console.log(jsonResult);          

          // close the database connection
          connection.end();

          res.json(results);
        });
      
    });

});

// Update (PUT) an item by ID
app.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedItem = req.body;
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
  } else {
    data[index] = { ...data[index], ...updatedItem };
    res.json(data[index]);
  }
});

// Delete (DELETE) an item by ID
app.delete('/items/:id', (req, res) => {
      const id = parseInt(req.params.id);
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) {
        res.status(404).json({ error: 'Item not found' });
      } else {
        const deletedItem = data.splice(index, 1);
        res.json(deletedItem[0]);
      }
});
