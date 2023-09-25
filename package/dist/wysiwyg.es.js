function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function dasherize(value) {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
}
function readInheritableStaticArrayValues(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, /* @__PURE__ */ new Set()));
}
function readInheritableStaticObjectPairs(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
}
function getAncestorsForConstructor(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
}
function getOwnStaticArrayValues(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}
function getOwnStaticObjectPairs(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
}
(() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a = function() {
      this.a.call(this);
    };
    const b = extendWithReflect(a);
    b.prototype.a = function() {
    };
    return new b();
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error) {
    return (constructor) => class extended extends constructor {
    };
  }
})();
function ClassPropertiesBlessing(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}
function propertiesForClassDefinition(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
}
function TargetPropertiesBlessing(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}
function propertiesForTargetDefinition(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
}
function ValuePropertiesBlessing(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read, writer: write } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === void 0) {
          this.data.delete(key);
        } else {
          this.data.set(key, write(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
}
function parseValueDefinitionPair([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
}
function parseValueTypeConstant(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
}
function parseValueTypeDefault(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
}
function parseValueTypeObject(payload) {
  const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
  if (!typeFromObject)
    return;
  const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
  if (typeFromObject !== defaultValueType) {
    const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
  }
  return typeFromObject;
}
function parseValueTypeDefinition(payload) {
  const typeFromObject = parseValueTypeObject({
    controller: payload.controller,
    token: payload.token,
    typeObject: payload.typeDefinition
  });
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
  const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
  throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
}
function defaultValueForDefinition(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const defaultValue = typeDefinition.default;
  if (defaultValue !== void 0)
    return defaultValue;
  return typeDefinition;
}
function valueDescriptorForTokenAndTypeDefinition(payload) {
  const key = `${dasherize(payload.token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(payload.typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(payload.typeDefinition) !== void 0;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
}
const defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
const readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value);
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
const writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};
function writeJSON(value) {
  return JSON.stringify(value);
}
function writeString(value) {
  return `${value}`;
}
class Controller {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
}
Controller.blessings = [ClassPropertiesBlessing, TargetPropertiesBlessing, ValuePropertiesBlessing];
Controller.targets = [];
Controller.values = {};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal$1;
var freeGlobal = _freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root$3 = freeGlobal || freeSelf || Function("return this")();
var _root = root$3;
var root$2 = _root;
var Symbol$4 = root$2.Symbol;
var _Symbol = Symbol$4;
var Symbol$3 = _Symbol;
var objectProto$5 = Object.prototype;
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;
var nativeObjectToString$1 = objectProto$5.toString;
var symToStringTag$1 = Symbol$3 ? Symbol$3.toStringTag : void 0;
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$5.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var _getRawTag = getRawTag$1;
var objectProto$4 = Object.prototype;
var nativeObjectToString = objectProto$4.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var _objectToString = objectToString$1;
var Symbol$2 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : void 0;
function baseGetTag$2(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
var _baseGetTag = baseGetTag$2;
function isObject$5(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_1 = isObject$5;
var baseGetTag$1 = _baseGetTag, isObject$4 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$1(value) {
  if (!isObject$4(value)) {
    return false;
  }
  var tag = baseGetTag$1(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$1;
var root$1 = _root;
var coreJsData$1 = root$1["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource$1(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var _toSource = toSource$1;
var isFunction = isFunction_1, isMasked = _isMasked, isObject$3 = isObject_1, toSource = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$3 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$4 = objectProto$3.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$4).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value) {
  if (!isObject$3(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object, key) {
  return object == null ? void 0 : object[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$3(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var _getNative = getNative$3;
var getNative$2 = _getNative;
var defineProperty$1 = function() {
  try {
    var func = getNative$2(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var _defineProperty = defineProperty$1;
var defineProperty = _defineProperty;
function baseAssignValue$1(object, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue = baseAssignValue$1;
function eq$2(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_1 = eq$2;
var baseAssignValue = _baseAssignValue, eq$1 = eq_1;
var objectProto$2 = Object.prototype;
var hasOwnProperty$3 = objectProto$2.hasOwnProperty;
function assignValue$1(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$3.call(object, key) && eq$1(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}
var _assignValue = assignValue$1;
var isArray$4 = Array.isArray;
var isArray_1 = isArray$4;
function isObjectLike$1(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_1 = isObjectLike$1;
var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
var symbolTag = "[object Symbol]";
function isSymbol$3(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
var isSymbol_1 = isSymbol$3;
var isArray$3 = isArray_1, isSymbol$2 = isSymbol_1;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey$1(value, object) {
  if (isArray$3(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol$2(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var _isKey = isKey$1;
var getNative$1 = _getNative;
var nativeCreate$4 = getNative$1(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
var objectProto$1 = Object.prototype;
var hasOwnProperty$2 = objectProto$1.hasOwnProperty;
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$1 ? void 0 : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto = Object.prototype;
var hasOwnProperty$1 = objectProto.hasOwnProperty;
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$1.call(data, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
var eq = eq_1;
function assocIndexOf$4(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data = this.__data__, index2 = assocIndexOf$3(data, key);
  if (index2 < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index2 == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index2, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data = this.__data__, index2 = assocIndexOf$2(data, key);
  return index2 < 0 ? void 0 : data[index2][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  if (index2 < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index2][1] = value;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$1(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache$1.prototype.clear = listCacheClear;
ListCache$1.prototype["delete"] = listCacheDelete;
ListCache$1.prototype.get = listCacheGet;
ListCache$1.prototype.has = listCacheHas;
ListCache$1.prototype.set = listCacheSet;
var _ListCache = ListCache$1;
var getNative = _getNative, root = _root;
var Map$1 = getNative(root, "Map");
var _Map = Map$1;
var Hash = _Hash, ListCache = _ListCache, Map = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map || ListCache)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$1(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache$1.prototype.clear = mapCacheClear;
MapCache$1.prototype["delete"] = mapCacheDelete;
MapCache$1.prototype.get = mapCacheGet;
MapCache$1.prototype.has = mapCacheHas;
MapCache$1.prototype.set = mapCacheSet;
var _MapCache = MapCache$1;
var MapCache = _MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize$1(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache)();
  return memoized;
}
memoize$1.Cache = MapCache;
var memoize_1 = memoize$1;
var memoize = memoize_1;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped$1(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var _memoizeCapped = memoizeCapped$1;
var memoizeCapped = _memoizeCapped;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath$1 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var _stringToPath = stringToPath$1;
function arrayMap$1(array, iteratee) {
  var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index2 < length) {
    result[index2] = iteratee(array[index2], index2, array);
  }
  return result;
}
var _arrayMap = arrayMap$1;
var Symbol$1 = _Symbol, arrayMap = _arrayMap, isArray$2 = isArray_1, isSymbol$1 = isSymbol_1;
var INFINITY$1 = 1 / 0;
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString$1(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$2(value)) {
    return arrayMap(value, baseToString$1) + "";
  }
  if (isSymbol$1(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
var _baseToString = baseToString$1;
var baseToString = _baseToString;
function toString$1(value) {
  return value == null ? "" : baseToString(value);
}
var toString_1 = toString$1;
var isArray$1 = isArray_1, isKey = _isKey, stringToPath = _stringToPath, toString = toString_1;
function castPath$1(value, object) {
  if (isArray$1(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}
var _castPath = castPath$1;
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex$1(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex = isIndex$1;
var isSymbol = isSymbol_1;
var INFINITY = 1 / 0;
function toKey$1(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var _toKey = toKey$1;
var assignValue = _assignValue, castPath = _castPath, isIndex = _isIndex, isObject$2 = isObject_1, toKey = _toKey;
function baseSet$1(object, path, value, customizer) {
  if (!isObject$2(object)) {
    return object;
  }
  path = castPath(path, object);
  var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index2 < length) {
    var key = toKey(path[index2]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object;
    }
    if (index2 != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : void 0;
      if (newValue === void 0) {
        newValue = isObject$2(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}
var _baseSet = baseSet$1;
var baseSet = _baseSet;
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}
var set_1 = set;
const isDate = (d) => d instanceof Date;
const isEmpty = (o) => Object.keys(o).length === 0;
const isObject$1 = (o) => o != null && typeof o === "object";
const hasOwnProperty = (o, ...args) => Object.prototype.hasOwnProperty.call(o, ...args);
const isEmptyObject = (o) => isObject$1(o) && isEmpty(o);
const makeObjectWithoutPrototype = () => /* @__PURE__ */ Object.create(null);
const updatedDiff = (lhs, rhs) => {
  if (lhs === rhs)
    return {};
  if (!isObject$1(lhs) || !isObject$1(rhs))
    return rhs;
  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() == rhs.valueOf())
      return {};
    return rhs;
  }
  return Object.keys(rhs).reduce((acc, key) => {
    if (hasOwnProperty(lhs, key)) {
      const difference = updatedDiff(lhs[key], rhs[key]);
      if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
        return acc;
      acc[key] = difference;
      return acc;
    }
    return acc;
  }, makeObjectWithoutPrototype());
};
function isObject(value) {
  return value !== null && typeof value === "object" && !(value instanceof Date);
}
var isArray = Array.isArray;
function deepKeys(obj, stack, parent, intermediate) {
  Object.keys(obj).forEach(function(el) {
    var escaped = el.replace(/\./g, "\\.");
    if (isObject(obj[el]) && !isArray(obj[el])) {
      var p = parent ? parent + "." + escaped : parent;
      if (intermediate)
        stack.push(parent ? p : escaped);
      deepKeys(obj[el], stack, p || escaped, intermediate);
    } else {
      var key = parent ? parent + "." + escaped : escaped;
      stack.push(key);
    }
  });
  return stack;
}
var deepKeys_1 = function(obj, intermediate) {
  return deepKeys(obj, [], null, intermediate);
};
function getMetaValue(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`);
  return element.getAttribute("content");
}
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(void 0);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}
class kubik_widget_controller_default extends Controller {
  connect() {
    this.getNewWidget();
  }
  moveItemUp(event) {
    const item = event.currentTarget;
    this.moveItemToPosition(item, -1);
  }
  moveItemDown(event) {
    const item = event.currentTarget;
    this.moveItemToPosition(item, 1);
  }
  moveItemToPosition(item, change) {
    const itemIndex = parseInt(item.dataset.itemIndex);
    const tab = item.dataset.targetList;
    const items = this.dataValue[tab]["repeated_items"];
    const newOrder = array_move(items, itemIndex, itemIndex + change);
    const newValues = Object.assign({}, this.dataValue);
    newValues[tab]["repeated_items"] = newOrder;
    this.dataValue = newValues;
  }
  removeItem(event) {
    const target = event.currentTarget;
    const index2 = target.dataset.itemIndex;
    const tab = target.dataset.targetList;
    const newValues = Object.assign({}, this.dataValue);
    newValues[tab]["repeated_items"].splice(index2, 1);
    this.dataValue = newValues;
    this.getNewWidget();
  }
  addItem(event) {
    const target = event.currentTarget;
    const tab = target.dataset.targetList;
    if (typeof this.dataValue[tab] == "undefined") {
      this.dataValue = Object.assign({}, this.dataValue, { [tab]: { "repeated_items": [] } });
    }
    this.dataValue = Object.assign({}, this.dataValue, { [tab]: { "repeated_items": [...this.dataValue[tab]["repeated_items"], {}] } });
    this.getNewWidget();
  }
  dataValueChanged(value, previousValue) {
    const diff = updatedDiff(value, previousValue);
    const changedKeys = deepKeys_1(diff);
    const addedItem = diff["items"] && diff["items"]["repeated_items"] && JSON.stringify(Object.values(diff["items"]["repeated_items"])[0]) === JSON.stringify({});
    if (addedItem || changedKeys.filter((key) => key.match(/^id$|\.id$/g)).length > 0) {
      this.getNewWidget();
    }
  }
  updateField(event) {
    const name = event.currentTarget.name;
    let v = event.currentTarget.value;
    if (event.currentTarget.dataset.boolean === "true" && event.currentTarget.type === "checkbox" && !event.currentTarget.checked) {
      v = 0;
    }
    if (event.currentTarget.dataset.checkbox === "true" && event.currentTarget.type === "checkbox") {
      v = Array.from(event.currentTarget.parentElement.parentElement.querySelectorAll("[name=`${event.currentTarget.name}`]")).map((el) => el.checked ? el.value : null).filter((el) => el !== null);
    }
    const duplicateData = set_1(this.dataValue, name, v);
    this.dataValue = duplicateData;
  }
  updateWysiwygField(event) {
    const name = event.currentTarget.dataset.fieldName;
    const duplicateData = set_1(this.dataValue, name, event.currentTarget.innerHTML);
    this.dataValue = duplicateData;
  }
  selectResult(e) {
    const target = e.currentTarget;
    const returnObject = JSON.parse(target.dataset.returnObject);
    const duplicateData = set_1(this.dataValue, target.dataset.fieldName, returnObject.id);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }
  removeResource(e) {
    const target = e.currentTarget;
    const duplicateData = set_1(this.dataValue, target.dataset.fieldName, null);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }
  receiveModalReturn(return_value) {
    const returnObject = return_value;
    const duplicateData = set_1(this.dataValue, returnObject["return_payload"]["field_name"], returnObject["payload"]["id"]);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }
  getNewWidget() {
    fetch(`${this.setupValue["src"]}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getMetaValue("csrf-token")
      },
      body: JSON.stringify({
        widget_id: this.widgetIdValue,
        data: this.dataValue,
        setup: this.setupValue,
        max_items: this.maxItemsValue
      })
    }).then((response) => response.json()).then((data) => {
      this.element.innerHTML = data.html_data;
    });
  }
}
kubik_widget_controller_default.values = {
  widgetId: String,
  setup: Object,
  data: Object,
  maxItems: { type: Number, default: 0 }
};
class kubik_repeater_controller_default extends Controller {
  connect() {
  }
  toggleItem(event) {
    Array.from(this.element.classList).includes(this.expandedClass) ? this.element.classList.remove(this.expandedClass) : this.element.classList.add(this.expandedClass);
  }
}
kubik_repeater_controller_default.classes = ["expanded"];
function makeElement(tagName, classNames = [], attributes = {}, textContent = "") {
  const el = document.createElement(tagName);
  el.classList.add(...classNames);
  for (const attrName in attributes) {
    el.setAttribute(attrName, attributes[attrName]);
  }
  if (typeof textContent == "string") {
    el.innerText = textContent;
  }
  return el;
}
class kubik_autocomplete_controller_default extends Controller {
  connect() {
    this._loadDefaultResults();
  }
  showForm() {
    this.element.classList.add(this.activeListClass);
  }
  cancel(event) {
    event.preventDefault();
    this.element.classList.remove(this.activeListClass);
  }
  errorValueChanged() {
    if (this.errorValue == "") {
      this.element.classList.remove(this.fetchErrorClass);
    } else {
      this.element.classList.add(this.fetchErrorClass);
    }
  }
  resultActiveValueChanged() {
    this.resultTargets.forEach((result) => {
      result.classList.remove(this.activeResultClass);
    });
    if (!isNaN(this.resultActiveValue)) {
      const activeResult = this.resultActiveValue;
      this.resultTargets[activeResult].classList.add(this.activeResultClass);
    }
  }
  mouseOver(e) {
    const target = e.currentTarget;
    this.resultActiveValue = parseInt(target.dataset["index"]);
  }
  mouseOut(e) {
    this.resultActiveValue = null;
  }
  resultsValueChanged() {
    const fieldNameValue = this.fieldNameValue;
    this.resultTargets.forEach((result) => result.remove());
    this.resultActiveValue = null;
    this.resultsValue.forEach((result, index2) => {
      const returnObject = Object.assign(
        { receive_index: this.inputTarget.dataset["itemIndex"] },
        result
      );
      const li = makeElement("li", [
        "kubik-wysiwyg-component--item-autocomplete-results-list-item"
      ], {
        "data-kubik-autocomplete-target": "result",
        "data-index": index2,
        "data-return-id": returnObject["id"],
        "data-return-object": JSON.stringify(returnObject),
        "data-field-name": fieldNameValue,
        "data-action": "mouseout->kubik-autocomplete#mouseOut mouseover->kubik-autocomplete#mouseOver mousedown->kubik-widget#selectResult mousedown->kubik-autocomplete#blur"
      }, result["return_object"]["display_name"]);
      this.resultsListTarget.insertBefore(li, this.feedbackTarget);
    });
    if (this.resultActiveValue > this.resultsValue.length) {
      this.resultActiveValue = this.resultsValue.length - 1;
    }
  }
  load() {
    this._fetchResults();
  }
  focus() {
    this.element.classList.add(this.activeClass);
  }
  blur() {
    this.errorValue = "";
    this.inputTarget.blur();
    this.connectionController.abort();
    this.element.classList.remove(this.fetchErrorClass);
    this.element.classList.remove(this.loadingClass);
    this.element.classList.remove(this.activeClass);
  }
  _sourceURL() {
    const baseUrl = [window.location.protocol, window.location.host].join("//");
    const params = new URLSearchParams({
      kubik_search: "1",
      q: this.inputTarget.value
    });
    const url = new URL([this.srcValue, ".json?", params.toString()].join(""), baseUrl);
    return url;
  }
  _loadDefaultResults() {
    this._fetchResults();
  }
  keyCheck(e) {
    switch (e.key) {
      case "Down":
      case "ArrowDown":
        this._nextResult();
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      case "Up":
      case "ArrowUp":
        this._previousResult();
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      case "Enter":
        const selectedElement = this.resultTargets[this.resultActiveValue];
        if (selectedElement) {
          selectedElement.dispatchEvent(new Event("mousedown"));
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      case "Backspace":
        e.stopImmediatePropagation();
        return;
    }
  }
  _previousResult() {
    if (isNaN(this.resultActiveValue)) {
      this.resultActiveValue = this.resultTargets.length > 1 ? this.resultTargets.length - 1 : 0;
    } else {
      this.resultActiveValue = this.resultActiveValue == 0 ? this.resultTargets.length - 1 : this.resultActiveValue - 1;
    }
  }
  _nextResult() {
    if (isNaN(this.resultActiveValue)) {
      this.resultActiveValue = 0;
    } else {
      this.resultActiveValue = this.resultActiveValue + 1 == this.resultTargets.length ? 0 : this.resultActiveValue + 1;
    }
  }
  _fetchResults() {
    this.errorValue = "";
    this.feedbackTarget.innerHTML = "Loading...";
    this.connectionController = new AbortController();
    fetch(this._sourceURL(), {
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => {
      return response.json();
    }).then((result) => {
      this.errorValue = "";
      if (result.length > 0) {
        this.resultsValue = result;
        this.queryValue = this.inputTarget.value;
      }
      if (this.inputTarget.value == "") {
        this.queryValue = "";
        this.feedbackTarget.innerHTML = "";
        this.feedbackTarget.insertAdjacentHTML("beforeend", `Showing latest <span>${result.length}</span> results`);
      } else {
        this.feedbackTarget.innerHTML = "";
        if (this.queryValue == "") {
          this.feedbackTarget.insertAdjacentHTML("beforeend", `Showing latest <span>${result.length}</span> results`);
        } else {
          this.feedbackTarget.insertAdjacentHTML("beforeend", `Showing results for <span>${this.queryValue}</span>`);
        }
      }
      if (this.queryValue == this.inputTarget.value) {
        this.element.classList.remove(this.noResultsClass);
      } else {
        this.element.classList.add(this.noResultsClass);
      }
    }).catch((error) => {
      this.feedbackTarget.innerHTML = "";
      this.errorValue = "Error loading the results";
    });
  }
}
kubik_autocomplete_controller_default.classes = ["fetchError", "loading", "active", "activeResult", "noResults", "activeList"];
kubik_autocomplete_controller_default.targets = ["feedback", "input", "resultsList", "result"];
kubik_autocomplete_controller_default.values = {
  returnController: String,
  src: String,
  fieldName: String,
  query: { type: String, default: "" },
  error: { type: String, default: "" },
  results: { type: Array, default: [] },
  resultActive: Number
};
const widgetWrapper = function widgetWrapper2(details = {}, data) {
  let wrapperAttributes = {
    "data-controller": "kubik-widget",
    "data-kubik-widget-setup-value": JSON.stringify(details.setup),
    "data-kubik-widget-data-value": JSON.stringify(data),
    "data-kubik-widget-widget-id-value": details.setup.widget_id,
    "data-kubik-widget-widget-icon": details.setup.config.icon,
    id: details.setup.widget_id
  };
  if (details.items_limit) {
    wrapperAttributes["data-kubik-widget-items-max-items-value"] = details.items_limit;
  }
  const wrapper = makeElement(
    "div",
    [
      "kubik_media_wrapper",
      "kubik-wysiwyg-component"
    ],
    wrapperAttributes
  );
  return wrapper;
};
class PluginFactory {
  static get defaultWidgetConfig() {
    return {
      data_src: "/admin/kubik_wysiwyg_widget/show"
    };
  }
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.randomString = Math.random().toString(36).substring(2, 7);
    this.label = this.constructor.toolbox.title;
    const defaultConfig = this.constructor.defaultWidgetConfig;
    const localConfig = this.constructor.widgetConfig;
    this.config = Object.assign(
      defaultConfig,
      localConfig
    );
  }
  render() {
    const widgetId = [this.config.widget_name, this.randomString].join("-");
    const wrapper = widgetWrapper({
      setup: {
        label: this.label,
        widget_model: this.config.widget_model,
        src: this.config.data_src,
        widget_id: widgetId,
        widget_type: this.config.widget_name,
        config: this.config
      }
    }, this.data);
    return wrapper;
  }
  save(blockContent) {
    const data = JSON.parse(blockContent.attributes["data-kubik-widget-data-value"].value);
    let widgetData = {};
    this.config.tabs.forEach((tab) => {
      widgetData[tab["name"]] = data[tab["name"]];
    });
    return widgetData;
  }
  validate(savedData) {
    return true;
  }
}
var index = {
  KubikWidgetController: kubik_widget_controller_default,
  KubikRepeaterController: kubik_repeater_controller_default,
  PluginFactory,
  KubikAutocompleteController: kubik_autocomplete_controller_default
};
export { index as default };
