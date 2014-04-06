/*!
 * JSONref - Adds references to your JSON!
 */

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var JSONref = {};
    factory(JSONref);
    if (typeof define === "function" && define.amd) {
      define(JSONref); // AMD
    } else {
      root.JSONref = JSONref; // <script>
    }
  }
}(this, function (JSONref) {

  JSONref.name = "JSONref";
  JSONref.version = "0.0.1";

  JSONref.idKey = '$id';
  JSONref.refKey = '$ref';
  JSONref.typeKey = '$type';
  JSONref.typed = true;

  JSONref.stringify = function (value) {
    var counter = 0;

    function convertReferences (object) {

      if (object.constructor.name !== 'Array') {
        counter += 1;

        object[JSONref.idKey] = counter;
        object[JSONref.typeKey] = object.constructor.name;
      }

      for (key in object) {
        if (typeof object[key] == "object" && object.hasOwnProperty(key)) {
          var nestedObj = object[key];

          if (nestedObj[JSONref.idKey]) {
            object[key] = {};
            object[key][JSONref.refKey] = nestedObj[JSONref.idKey];
          } else {
            convertReferences(nestedObj);
          }
        }
      }
    }

    if (!(typeof value === "object" || typeof value === "array")) {
      return JSON.stringify(value);
    }

    convertReferences(value);

    return JSON.stringify(value);
  };

  JSONref.parse = function (json) {
    var stringToFunction = function (str) {
      var arr = str.split(".");

      var fn = (typeof window !== "undefined" ? window : this);
      for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
      }

      if (typeof fn !== "function") {
        throw new Error("Function not found");
      }

      return  fn;
    };

    var deserialized = JSON.parse(json);
    var references = {};


    if (!(typeof deserialized === "object" || typeof deserialized === "array")) {
      return deserialized;
    }

    function makeInstance (object) {
      var type = object[JSONref.typeKey];
      var fn = stringToFunction(type);
      var instance = new fn();

      for (key in object) {
        instance[key] = object[key];
      }

      delete instance[JSONref.typeKey];

      return instance;
    }


    function extractReferences (object) {
      if (object.hasOwnProperty(JSONref.idKey)) {
        var id = object[JSONref.idKey];

        references[id] = object;
      }

      for (var key in object) {
        if (object.hasOwnProperty(key) && typeof object[key] == "object") {
          extractReferences(object[key]);
        }
      }
    }

    function reconstitute (object) {
      if (object.constructor.name === "Array") {

        for (var i in object) {
          if (typeof object[i] === 'object') {
            object[i] = reconstitute(object[i]);
          }
        }

        return object;
      }

      var ref;

      if (object.hasOwnProperty(JSONref.idKey)) {
        ref = object[JSONref.idKey];

        delete object[JSONref.idKey];
      }
      if (object.hasOwnProperty(JSONref.refKey)) {
        ref = object[JSONref.refKey];

        delete object[JSONref.refKey];
      }

//      if (! ref) {
//        return object;
//      }

      var referred = references[ref];

      delete referred[JSONref.idKey];
      delete referred[JSONref.refKey];

      for (var key in referred) {
        if (referred.hasOwnProperty(key) && typeof referred[key] === 'object') {
          if (referred[key][JSONref.idKey] || referred[key][JSONref.refKey]) {
            referred[key] = reconstitute(referred[key]);
          }
        }
      }

      return referred;
    }

    extractReferences(deserialized);

    for (var key in references) {
      references[key] = makeInstance(references[key]);
    }

    if (deserialized.constructor.name === "Object") {

      return reconstitute(deserialized);

    } else if (deserialized.constructor.name === "Array") {

      for (var i in deserialized) {
        if (typeof deserialized[i] === 'object') {
          deserialized[i] = reconstitute(deserialized[i]);
        }
      }

      return deserialized;

    }

  };

}));