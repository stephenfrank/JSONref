JSONref
=======
*Super experimental not-production-code*

JSON encodes javascript object graphs with object references. This allows for circular references and saves a few bytes if a single object is referenced multiple times.

```
  var foo = {name: "foo"};

  var bar = {
    name: "bar",
    foo: foo
  };

  foo.bar = bar;
  
  var json = JSONref.stringify(foo);
  
  // Output:
  // {
  // 	"$id": 1,
  // 	"$type": "Object",
  // 	"name": "foo",
  // 	"bar": {
  // 		"$id": 2,
  // 		"$type": "Object",
  // 		"name": "bar",
  // 		"foo": {
  // 			"$ref": 1
  // 		}
  // 	}
  // }
```

More complex example which shows the use of javascript typed objects and some configurable properties of the library.


```
  function Foo() {
  }

  function Bizz() {
  }

  JSONref.idKey = "__id";
  JSONref.refKey = "__ref";
  JSONref.typeKey = "__type";

  (function () {
    var foo = new Foo();

    foo.name = "foo";

    var bar = {
      name: "bar",
      referencedFoo: foo
    };

    var bizz = new Bizz;

    bizz.name = "bizz";
    bizz.referencedFoo = foo;

    foo.referencedBar = bar;
    foo.referencedBizz = bizz;

    json = JSONref.stringify([bizz, [foo, bar], "blah"]);

    console.log(json);
  })();
  
  // Outputs:
  // [
  //   {
  //     "name": "bizz",
  //     "referencedFoo":
  //     {
  //       "name": "foo",
  //       "referencedBar":
  //       {
  //         "name": "bar",
  //         "referencedFoo":
  //         {
  //           "__ref": 2
  //         },
  //         "__id": 3,
  //         "__type": "Object"
  //       },
  //       "referencedBizz":
  //       {
  //         "__ref": 1
  //       },
  //       "__id": 2,
  //       "__type": "Foo"
  //     },
  //     "__id": 1,
  //     "__type": "Bizz"
  //   },
  //   [
  //     {
  //       "__ref": 2
  //     }, {
  //       "__ref": 3
  //     }
  //   ],
  //   "blah"
  // ]
```

