const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('products/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { Nombre, Tipo, Cantidad, Precio } = req.body;
    const UsuarioModificacion = req.user.UsuarioId;
    const newProduct = {
        Nombre,
        Tipo,
        Cantidad,
        UsuarioModificacion,
        Precio
    };

    await pool.query('INSERT INTO producto set ?', [newProduct]);
    req.flash('success', 'Producto agregado correctamente');
    res.redirect('/products');
});

router.get('/', isLoggedIn, async (req, res) => {
    const products = await pool.query('SELECT * FROM producto');
    res.render('products/list', {products});
});

router.get('/list/bebidas', isLoggedIn, async (req, res) => {
    const products = await pool.query('SELECT * FROM producto WHERE Tipo = ?', 1);
    const title = 'Bebidas';
    res.render('products/list', {products, title});
});

router.get('/list/licores', isLoggedIn, async (req, res) => {
    const products = await pool.query('SELECT * FROM producto WHERE Tipo = ?', 2);
    const title = 'Licores';
    res.render('products/list', {products, title});
});

router.get('/list/comidas', isLoggedIn, async (req, res) => {
    const products = await pool.query('SELECT * FROM producto WHERE Tipo = ?', 3);
    const title = 'Comidas';
    res.render('products/list', {products, title});
});

router.get('/delete/:ProductoId', isLoggedIn, async (req, res) => {
    const { ProductoId } = req.params;
    await pool.query('DELETE FROM Producto WHERE ProductoId = ?', [ProductoId]);
    req.flash('success', 'Producto eliminado satisfactoriamente');
    res.redirect('/products');
});

router.get('/edit/:ProductoId', isLoggedIn, async (req, res) => {
    bebida = false
    licor = false
    comida = false
    const { ProductoId } = req.params;
    const rows = await pool.query('SELECT * FROM Producto WHERE ProductoId = ?', [ProductoId]);
    const product = rows[0];

    if(product.Tipo == 1){
        bebida = true
    }else if(product.Tipo == 2){
        licor = true
    }else{
        comida = true
    }
    
    res.render('products/edit', {product, bebida, licor, comida});
});

router.post('/edit/:ProductoId', isLoggedIn, async (req, res) => {
    const { ProductoId } = req.params;
    const { Nombre, Tipo, Cantidad, Precio} = req.body;
    const UsuarioModificacion = req.user.UsuarioId;
    const newProduct = {
        Nombre,
        Tipo,
        Cantidad,
        UsuarioModificacion,
        Precio
    };
    await pool.query('UPDATE Producto set ? WHERE ProductoId = ?', [newProduct, ProductoId]);
    req.flash('success', 'Producto modificado exitosamente')
    res.redirect('/products');
})

module.exports = router;