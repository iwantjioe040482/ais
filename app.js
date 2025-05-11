const express = require('express');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the host or default to 3000

// Set up the MySQL connection
const dbConfig = {
    host: '172.17.12.127',
    port: '3306',
    user: 'dbuser',
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

app.get('/parthome', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select part_id as id,part_name as name,part_number as sn from mst_vehicle_part where type_id="2"';
  
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

app.post('/parthome', (req, res) => {
  const newPart = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newPart === 'string') {
        try {
            part = JSON.parse(newPart);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
        part = newPart;
    }

    // insert statment
    let sql = 'INSERT INTO mst_vehicle_part (part_name,part_number,type_id) VALUES (?,?,"2")';
    let values = [part.name,part.sn];

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
      res.status(201).json(newPart);
    });
  
  
  });

});


app.get('/part', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select part_id as id,part_name as name,part_number as sn from mst_vehicle_part where type_id="1"';
  
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
app.post('/part', (req, res) => {
  const newPart = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newPart === 'string') {
        try {
            part = JSON.parse(newPart);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
        part = newPart;
    }

    // insert statment
    let sql = 'INSERT INTO mst_vehicle_part (part_name,part_number,type_id) VALUES (?,?,"1")';
    let values = [part.name,part.sn];

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
      res.status(201).json(newPart);
    });
  
  
  });

});

app.get('/location', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select location_id as id,location_name as name from mst_location';
  
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

app.get('/sparepart', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select p.part_id as id,p.part_name as name,coalesce(p.part_number,"") as sn,t.qty,t.location_id,l.location_name,DATE_FORMAT(t.timestamp, "%Y-%m-%d %H:%i:%s") AS timestamp from  ais.mst_vehicle_part p inner join ais.tr_part_history t on t.part_id=p.part_id inner join mst_location l on l.location_id=t.location_id';
  
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
          '(select l.location_name from tr_asset_history tr inner join mst_location l on l.location_id=tr.location_id where tr.asset_id=a.asset_id order by tr.time_stamp desc limit 1) as last_location,t.asset_icon from ais.mst_asset a ' +
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

function recurringtransaction(ssparams)
{
  var sql="";

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          return 'Failed to connect to the database';
      }

      switch (ssparams) {
        case "tax":
          sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="3" order by r.name';
          break;
        case "insurance":
          sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="1" order by r.name';
          break;
        case "creditcard":
          sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="2" order by r.name';
          break;
        }

  
      // execute the insert statmentßß
      connection.query(sql,  (err,results, fields) => {
        if (err) 
        {
          return 'Failed to execute query';
        }
        // Convert the query results to JSON
        const jsonResult = JSON.stringify(results);
        console.log(jsonResult);          

        // close the database connection
        connection.end();
        return jsonResult;
      });
    
  });

};

app.get('/tax', (req, res) => {

  const connection = createConnection();

  connection.connect((err) => {
      if (err) 
      {
          res.status(500).json({ error: 'Failed to connect to the database' });
          return console.error(err.message);
      }
    
      // insert statment
      let sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="3" order by r.name';
  
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

app.get('/expense', (req, res) => {

const connection = createConnection();

connection.connect((err) => {
    if (err)
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    // insert statment
    let sql = 'select * from vw_DailyExpenses';

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

app.get('/priority', (req, res) => {

const connection = createConnection();

connection.connect((err) => {
    if (err)
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    // insert statment
    let sql = 'select priority_id as id,priority_name from mst_priority';

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

app.post('/cimbexpense', (req, res) => {
  const newCIMBExpense = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newCIMBExpense === 'string') {
        try {
            part = JSON.parse(newCIMBExpense);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
        part = newCIMBExpense;
    }

    // insert statment
    let sql = 'CALL InsertCIMBLedger (?,?,?,?)';
    let values = [part.coa_id,part.description,part.total,part.priority_id];

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
      res.status(201).json(newCIMBExpense);
    });
  
  
  });

});

app.post('/cashexpense', (req, res) => {
  const newCashExpense = req.body;
  const connection = createConnection();

  connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    if (typeof newCashExpense === 'string') {
        try {
            part = JSON.parse(newCashExpense);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    } else {
        part = newCashExpense;
    }

    // insert statment
    let sql = 'CALL InsertCashLedger (?,?,?,?)';
    let values = [part.coa_id,part.description,part.total,part.priority_id];

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
      res.status(201).json(newCashExpense);
    });
  
  
  });

});


app.get('/coaexpense', (req, res) => {

const connection = createConnection();

connection.connect((err) => {
    if (err)
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    // insert statment
    let sql = 'select * from vw_CoaExpenses';

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

  //let err=recurringtransaction("creditcard");
   //if (err=='Failed to connect to the database')
  // {
   //     res.status(500).json({ error: 'Failed to connect to the database' });
  // }
   //else if (err=='Failed to execute query')
   //{
   //     res.status(500).json({ error: 'Failed to execute query' });
  // }
  // else
  // {
     //   res.json(err);
//   }

const connection = createConnection();

connection.connect((err) => {
    if (err) 
    {
        res.status(500).json({ error: 'Failed to connect to the database' });
        return console.error(err.message);
    }
  
    // insert statment
    let sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="2" order by r.name';

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
      let sql = 'select r.recurring_id as id,r.name,DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,DATEDIFF(r.end_to,CURDATE()) as remaining,DATEDIFF(r.end_to,r.start_from)-1 as timeline,u.name as username from ais.recurring r inner join ais.mst_user u on u.user_id=r.user_id where r.type_id ="1"';
  
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
