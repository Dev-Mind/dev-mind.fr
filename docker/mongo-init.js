db = db.getSiblingDB('admin');
db.createUser({user: "devmind", pwd: "pass", roles : [{role: "readWrite", db: "devminddb"}], passwordDigestor:'server'});

db = db.getSiblingDB('devminddb');
db.createUser({user: "devmind", pwd: "pass", roles : [{role: "readWrite", db: "devminddb"}], passwordDigestor:'server'});
db.createCollection('init');
