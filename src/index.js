const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const customer = users.find((customer) => 
    customer.username === username
  );

  if(!customer) {
    return response.status(404).json({error: "user not find"});
  }
  
  request.customer = customer;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists) {
    return response.status(400).json({error: "Usuário já existe"});
  }
  const user = { 
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }

  users.push(user);

  
  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {customer} = request;

   return response.json(customer.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { customer } = request;

    const todo = {
      id:uuidv4(),
      title,
      done:false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    customer.todos.push(todo);

    return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const {customer} = request;

  const todoExists = customer.todos.find( todo => todo.id === id);
  

  if(!todoExists) {
    return response.status(404).json({error: "todo not find"});   
  }
  
  todoExists.title = title;
  todoExists.deadline = new Date(deadline);

  return response.status(201).json(todoExists);
});



app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {customer} = request;
  const {id} = request.params;

  const todoExists = customer.todos.find ( todo => todo.id === id);

  if(!todoExists){
    return response.status(404).json({error: " todo not find"});
  }

  todoExists.done = true;

  return response.status(201).json(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {customer} = request;
  const {id} = request.params;

  const todoIndex = customer.todos.findIndex( todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: "todo not find"});
  }

  customer.todos.splice(todoIndex,1);

  return response.status(204).send();
});

module.exports = app;