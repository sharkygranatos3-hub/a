const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');

// Alle Mitarbeiter abrufen
router.get('/', auth, async (req, res)=>{
  const employees = await Employee.find();
  res.json(employees);
});

// Mitarbeiter erstellen
router.post('/', auth, async (req,res)=>{
  const { firstname, lastname, rank, username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const newEmployee = new Employee({ firstname, lastname, rank, username, password: hash });
  await newEmployee.save();
  res.json(newEmployee);
});

// Bearbeiten
router.put('/:id', auth, async (req,res)=>{
  const emp = await Employee.findById(req.params.id);
  if(!emp) return res.status(404).json({msg:'Nicht gefunden'});
  Object.assign(emp, req.body);
  await emp.save();
  res.json(emp);
});

// Löschen
router.delete('/:id', auth, async (req,res)=>{
  await Employee.findByIdAndDelete(req.params.id);
  res.json({msg:'Gelöscht'});
});

module.exports = router;
