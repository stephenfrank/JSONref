var test = require('tape');

var JSONref = require('../JSONref.js');

//test('stringify', function(t) {
//  t.same(JSONref.stringify([]), '[]');
//});

test('stringify', function(t) {
  t.plan(1);

  t.same(JSONref.stringify({}), '{"$id":1,"$type":"Object"}');
});

test('stringify', function(t) {
  t.plan(1);

  t.same(JSONref.stringify([]), '[]');
});

test('stringify', function(t) {
  t.plan(1);

  var foo = {name: "foo"};

  var bar = {
    name: "bar",
    foo: foo
  };

  foo.bar = bar;

  t.same(JSONref.stringify(foo), '{"name":"foo","bar":{"name":"bar","foo":{"$ref":1},"$id":2,"$type":"Object"},"$id":1,"$type":"Object"}');
});

test('parse standard object', function(t) {
  t.plan(1);

  t.same(JSONref.parse('{"$id":1,"$type":"Object"}'), {});
});

test('parse empty array', function(t) {
  t.plan(1);

  t.same(JSONref.parse('[]'), []);
});

test('parse complex', function(t) {
  t.plan(1);

  var foo = {name: "foo"};

  var bar = {
    name: "bar"
  };

  foo.bar = bar;

  t.same(JSONref.parse('{"name":"foo","bar":{"name":"bar","$id":2,"$type":"Object"},"$id":1,"$type":"Object"}'), foo);
});
