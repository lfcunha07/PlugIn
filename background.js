// REF: https://stackoverflow.com/questions/17745292/how-to-retrieve-all-localstorage-items-without-knowing-the-keys-in-advance
var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;
while(i--){
    values.push(keys[i])
};
values;