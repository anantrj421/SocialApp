const express = require('express');
const app = express();
const bp = require('body-parser')
const ejs = require('ejs');
const firebase = require('firebase');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

require('firebase/database');
var firebaseConfig = {
	// Enter your firebase credentials
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
app.use(cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: 'dadahshjkhakshfkklsajlla'
}));
app.use(bp.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
	res.render('home');
});
app.get("/thanks", function (req, res) {
	res.render("thanks");
});
app.get("/error", function (req, res) {
	res.render("error");
});
app.get("/autherr", function (req, res) {
	res.render("autherr");
});
app.get('/submit', function (req, res) {
	res.render('form');
});
app.get('/logout', function (req, res) {
	res.redirect('/');
});
app.get('/:uid/:cu', (req, res) => {
	var user = req.params.uid;
	var uid = "";
	firebase.database().ref('users').on("value", function (data) {
		var users = data.val();
		var keys = Object.keys(users);
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			if (users[k].user_id == user) {
				uid = users[k].name;
			}
		}
	}, function (error) {
		console.log(error);
	});
	firebase.database().ref('posts').on("value", function (data) {
		var posts = data.val();
		var keys = Object.keys(posts);
		var arr = [];
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			arr[i] = posts[k];
		}
		res.render("user", {
			url: "", title: uid, list: arr
		});
	}, function (error) {
		console.log(error);
	});
});
app.post('/login', (req, resp) => {
	var id = req.body.id;
	var psd = req.body.psd;
	firebase.database().ref('users').orderByChild('user_id').equalTo(id).on("value", function (snapshot) {
		if (snapshot.val() == null) { //checking for user
			return resp.render('autherr');
		}
		else {
			snapshot.forEach(function (data) {
				var k = data.key; //key for specific ID
				firebase.database().ref('users').on("value", function (data) {
					var users = data.val();
					var saltu = 2;
					bcrypt.compare(psd, users[k].password, function (err, res) { //password match
						if (res == true) {
							bcrypt.hash(id, saltu).then(function (hash) {
								var cu = hash.substring(0, 11);
								return resp.redirect("/" + id + "/" + cu);
							});
						}
						else {
							return resp.render("autherr");
						}
					});
				});
			});
		}
	});
});

app.post("/register", function (req, res) {
	var id = req.body.id;
	var psd = req.body.psd;
	var age = req.body.age;
	var nm = req.body.nm;
	var saltr = 5;
			bcrypt.hash(psd, saltr, function (err, hash) {
				if (!err) {
					var pd = hash;
					var newPostKey = firebase.database().ref().child('users').push().key;
					database.ref('users/' + newPostKey).set({
						user_id: id, password: pd, user_age: age, name: nm
					});
					return res.render('thanks');
				}
				else {
					console.log(err);
				}
			});
});
app.post('/submit', function (req, res) {
	var id = req.body.id;
	var ttl = req.body.ttl;
	var dsc = req.body.dsc;
	var newPostKey = firebase.database().ref().child('posts').push().key;
	database.ref('posts/' + newPostKey).set({
		user_id: id, title: ttl, desc: dsc
	});
	res.render('thanks');
}, function (error) {
	console.log(error);
});
// app.get("/data", function (req, res) {
// 	firebase.database().ref('posts').on("value", function (data) {
// 		var posts = data.val();
// 		var arr = [];
// 		var keys = Object.keys(posts);
// 		for (var i = 0; i < keys.length; i++) {
// 			var k = keys[i];
// 			arr[i] = posts[k];
// 		}
// 		console.log(arr);

// 		res.render("user", {
// 			list: arr, title: "Data"
// 		});
// 	}, function (error) {
// 		console.log(error);
// 	});
// });
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
	console.log("Started");
});
