// Imports
import { Todo } from '../providers/db';
import Controller from '../types/controller';
import { Request, Response } from 'express';
import utils from '../../lib/utils';
import { loadLabels } from '../providers/labels';
import { createLogger } from '../../lib/logging';


// Types
import { Label } from '../types/label';


// Setup
const { logger, log, lj, deb } = createLogger({fileName: __filename});


const TodoController = new Controller('/todo');

TodoController.post(
  '/create',
  create
);

TodoController.get(
  '/all',
  retrieve
);

TodoController.get(
  '/:id',
  retrieve
);

TodoController.put(
  '/:id/update',
  update
);

TodoController.delete(
  '/:id/delete',
  remove
);

async function create(req: Request, res: Response) {
  const { message, label } = req.body;
  if (!utils.isString(message)) {
    res.status(400).json({error: 'Message is required and must be a string.'});
    return;
  }
  if (!utils.isString(label)) {
    res.status(400).json({error: 'Label is required and must be a string.'});
    return;
  }
  const today = new Date();
  // Set due date to 30 days from now.
  const dueDate = new Date(today.setDate(today.getDate() + 30)).toISOString();
  const labels = await loadLabels(); // Future: cache this.
  let labelObj: Label;
  if (labels.length == 1 && labels[0].id == 'X') {
    logger.error(labels[0].name);
    labelObj = labels[0];
  } else {
    labelObj = labels.find((l) => l.name === label);
    if (!labelObj) {
      res.status(400).json({error: `Label '${label}' not found.`});
      return;
    }
  }
  let todo = await Todo.create({
    message,
    label: labelObj.id,
    dueDate,
  });
  const msg = `Created todo item: ${JSON.stringify(todo)}`;
  log(msg);
  res.json({error: null, result: todo});
}

async function retrieve(req: Request, res: Response) {
  const id = req.params.id;
  if (id) {
    if (!utils.isNumericString(id)) {
      res.status(400).json({error: `Invalid ID: ${id}`});
      return;
    }
    const todo = await Todo.findByPk(id);
    if (!todo) {
      res.status(404).json({error: `Todo with ID=${id} not found`});
      return;
    }
    const msg = `Retrieved todo item: ${JSON.stringify(todo)}`;
    log(msg);
    res.json({error: null, result: todo});
  } else {
    const todos = await Todo.findAll();
    const msg = `Retrieved all ${todos.length} todo items.`;
    res.json({error: null, result: todos});
  }
}

async function update(req: Request, res: Response) {
  const id = req.params.id;
  if (!utils.isNumericString(id)) {
    res.status(400).json({error: `Invalid ID: ${id}`});
    return;
  }
  const todo = await Todo.findByPk(id);
  if (!todo) {
    res.status(404).json({error: `Todo with ID=${id} not found`});
    return;
  }
  const { message, label } = req.body;
  let newProperties: any = {};
  if (message) {
    if (!utils.isString(message)) {
      res.status(400).json({error: 'Message is required and must be a string.'});
      return;
    }
    newProperties['message'] = message;
  }
  if (label) {
    if (!utils.isString(label)) {
      res.status(400).json({error: 'Label is required and must be a string.'});
      return;
    }
    newProperties['label'] = label;
  }
  await todo.update(newProperties);
  const msg = `Updated todo item: ${JSON.stringify(todo)}`;
  log(msg);
  res.json({error: null, result: todo});
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  if (!utils.isNumericString(id)) {
    res.status(400).json({error: `Invalid ID: ${id}`});
    return;
  }
  const todo = await Todo.findByPk(id);
  if (!todo) {
    res.status(404).json({error: `Todo with ID=${id} not found`});
    return;
  }
  //const todoData = JSON.parse(JSON.stringify(todo));
  await todo.destroy();
  const msg = `Deleted todo item: ${JSON.stringify(todo)}`;
  log(msg);
  res.json({error: null, result: todo});
}

export default TodoController;