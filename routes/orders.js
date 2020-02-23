const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('orders/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { NombreCliente, Descripcion } = req.body;
    const UsuarioId = req.user.UsuarioId;
    const newOrder = {
        NombreCliente,
        Descripcion,
        UsuarioId
    };

    await pool.query('INSERT INTO Orden set ?', [newOrder]);
    req.flash('success', 'Orden agregada correctamente');
    res.redirect('/orders');
});

router.get('/', isLoggedIn, async (req, res) => {
    const orders = await pool.query('SELECT * FROM orden o join usuario u ON o.UsuarioId = u.UsuarioId');
    res.render('orders/list', {orders});
})

router.get('/pay/:OrdenId', isLoggedIn, async (req, res) => {
    const { OrdenId } = req.params;
    await pool.query('DELETE FROM Orden WHERE OrdenId = ?', [OrdenId]);
    req.flash('success', 'Orden pagada satisfactoriamente');
    res.redirect('/orders');
});

router.get('/edit/:OrdenId', isLoggedIn, async (req, res) => {
    const { OrdenId } = req.params;
    const orders = await pool.query('SELECT * FROM Orden WHERE OrdenId = ?', [OrdenId])
    res.render('orders/edit', {order: orders[0]});
});

router.post('/edit/:OrdenId', isLoggedIn, async (req, res) => {
    const { OrdenId } = req.params;
    const { NombreCliente, Descripcion } = req.body;
    const newOrder = {
        NombreCliente,
        Descripcion
    };
    await pool.query('UPDATE Orden set ? WHERE OrdenId = ?', [newOrder, OrdenId]);
    req.flash('success', 'Orden modificada exitosamente')
    res.redirect('/orders');
})


module.exports = router;