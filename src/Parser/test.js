let firstname = process.argv[2]; //Chaitram Samuel Davenport
let lastname = process.argv[3];
let location = process.argv[4];

let res = [];
res[0] = {
    firstname: 'firstname',
    lastname: 'lastname',
    age: 22,
    address: "location",
    link: 'link',
};
res[1] = {
    firstname: 'firstname2',
    lastname: 'lastname2',
    age: 223,
    address: "location2",
    link: 'link2',
};

console.log(JSON.stringify({message: res, error: null}));
