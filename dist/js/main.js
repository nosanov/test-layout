(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.window = global.window || {}));
}(this, (function (exports) { 'use strict';

	/*!
	 * ScrollTrigger 3.9.1
	 * https://greensock.com
	 *
	 * @license Copyright 2008-2021, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/
	var gsap,
	    _coreInitted,
	    _win,
	    _doc,
	    _docEl,
	    _body,
	    _root,
	    _resizeDelay,
	    _toArray,
	    _clamp,
	    _time2,
	    _syncInterval,
	    _refreshing,
	    _pointerIsDown,
	    _transformProp,
	    _i,
	    _prevWidth,
	    _prevHeight,
	    _autoRefresh,
	    _sort,
	    _suppressOverwrites,
	    _ignoreResize,
	    _limitCallbacks,
	    _startup = 1,
	    _proxies = [],
	    _scrollers = [],
	    _getTime = Date.now,
	    _time1 = _getTime(),
	    _lastScrollTime = 0,
	    _enabled = 1,
	    _passThrough = function _passThrough(v) {
	  return v;
	},
	    _getTarget = function _getTarget(t) {
	  return _toArray(t)[0] || (_isString(t) && gsap.config().nullTargetWarn !== false ? console.warn("Element not found:", t) : null);
	},
	    _round = function _round(value) {
	  return Math.round(value * 100000) / 100000 || 0;
	},
	    _windowExists = function _windowExists() {
	  return typeof window !== "undefined";
	},
	    _getGSAP = function _getGSAP() {
	  return gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap;
	},
	    _isViewport = function _isViewport(e) {
	  return !!~_root.indexOf(e);
	},
	    _getProxyProp = function _getProxyProp(element, property) {
	  return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
	},
	    _getScrollFunc = function _getScrollFunc(element, _ref) {
	  var s = _ref.s,
	      sc = _ref.sc;

	  var i = _scrollers.indexOf(element),
	      offset = sc === _vertical.sc ? 1 : 2;

	  !~i && (i = _scrollers.push(element) - 1);
	  return _scrollers[i + offset] || (_scrollers[i + offset] = _getProxyProp(element, s) || (_isViewport(element) ? sc : function (value) {
	    return arguments.length ? element[s] = value : element[s];
	  }));
	},
	    _getBoundsFunc = function _getBoundsFunc(element) {
	  return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function () {
	    _winOffsets.width = _win.innerWidth;
	    _winOffsets.height = _win.innerHeight;
	    return _winOffsets;
	  } : function () {
	    return _getBounds(element);
	  });
	},
	    _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref2) {
	  var d = _ref2.d,
	      d2 = _ref2.d2,
	      a = _ref2.a;
	  return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function () {
	    return a()[d];
	  } : function () {
	    return (isViewport ? _win["inner" + d2] : scroller["client" + d2]) || 0;
	  };
	},
	    _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
	  return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function () {
	    return _winOffsets;
	  };
	},
	    _maxScroll = function _maxScroll(element, _ref3) {
	  var s = _ref3.s,
	      d2 = _ref3.d2,
	      d = _ref3.d,
	      a = _ref3.a;
	  return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? (_body[s] || _docEl[s]) - (_win["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2];
	},
	    _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
	  for (var i = 0; i < _autoRefresh.length; i += 3) {
	    (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
	  }
	},
	    _isString = function _isString(value) {
	  return typeof value === "string";
	},
	    _isFunction = function _isFunction(value) {
	  return typeof value === "function";
	},
	    _isNumber = function _isNumber(value) {
	  return typeof value === "number";
	},
	    _isObject = function _isObject(value) {
	  return typeof value === "object";
	},
	    _callIfFunc = function _callIfFunc(value) {
	  return _isFunction(value) && value();
	},
	    _combineFunc = function _combineFunc(f1, f2) {
	  return function () {
	    var result1 = _callIfFunc(f1),
	        result2 = _callIfFunc(f2);

	    return function () {
	      _callIfFunc(result1);

	      _callIfFunc(result2);
	    };
	  };
	},
	    _endAnimation = function _endAnimation(animation, reversed, pause) {
	  return animation && animation.progress(reversed ? 0 : 1) && pause && animation.pause();
	},
	    _callback = function _callback(self, func) {
	  if (self.enabled) {
	    var result = func(self);
	    result && result.totalTime && (self.callbackAnimation = result);
	  }
	},
	    _abs = Math.abs,
	    _scrollLeft = "scrollLeft",
	    _scrollTop = "scrollTop",
	    _left = "left",
	    _top = "top",
	    _right = "right",
	    _bottom = "bottom",
	    _width = "width",
	    _height = "height",
	    _Right = "Right",
	    _Left = "Left",
	    _Top = "Top",
	    _Bottom = "Bottom",
	    _padding = "padding",
	    _margin = "margin",
	    _Width = "Width",
	    _Height = "Height",
	    _px = "px",
	    _horizontal = {
	  s: _scrollLeft,
	  p: _left,
	  p2: _Left,
	  os: _right,
	  os2: _Right,
	  d: _width,
	  d2: _Width,
	  a: "x",
	  sc: function sc(value) {
	    return arguments.length ? _win.scrollTo(value, _vertical.sc()) : _win.pageXOffset || _doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
	  }
	},
	    _vertical = {
	  s: _scrollTop,
	  p: _top,
	  p2: _Top,
	  os: _bottom,
	  os2: _Bottom,
	  d: _height,
	  d2: _Height,
	  a: "y",
	  op: _horizontal,
	  sc: function sc(value) {
	    return arguments.length ? _win.scrollTo(_horizontal.sc(), value) : _win.pageYOffset || _doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
	  }
	},
	    _getComputedStyle = function _getComputedStyle(element) {
	  return _win.getComputedStyle(element);
	},
	    _makePositionable = function _makePositionable(element) {
	  var position = _getComputedStyle(element).position;

	  element.style.position = position === "absolute" || position === "fixed" ? position : "relative";
	},
	    _setDefaults = function _setDefaults(obj, defaults) {
	  for (var p in defaults) {
	    p in obj || (obj[p] = defaults[p]);
	  }

	  return obj;
	},
	    _getBounds = function _getBounds(element, withoutTransforms) {
	  var tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap.to(element, {
	    x: 0,
	    y: 0,
	    xPercent: 0,
	    yPercent: 0,
	    rotation: 0,
	    rotationX: 0,
	    rotationY: 0,
	    scale: 1,
	    skewX: 0,
	    skewY: 0
	  }).progress(1),
	      bounds = element.getBoundingClientRect();
	  tween && tween.progress(0).kill();
	  return bounds;
	},
	    _getSize = function _getSize(element, _ref4) {
	  var d2 = _ref4.d2;
	  return element["offset" + d2] || element["client" + d2] || 0;
	},
	    _getLabelRatioArray = function _getLabelRatioArray(timeline) {
	  var a = [],
	      labels = timeline.labels,
	      duration = timeline.duration(),
	      p;

	  for (p in labels) {
	    a.push(labels[p] / duration);
	  }

	  return a;
	},
	    _getClosestLabel = function _getClosestLabel(animation) {
	  return function (value) {
	    return gsap.utils.snap(_getLabelRatioArray(animation), value);
	  };
	},
	    _snapDirectional = function _snapDirectional(snapIncrementOrArray) {
	  var snap = gsap.utils.snap(snapIncrementOrArray),
	      a = Array.isArray(snapIncrementOrArray) && snapIncrementOrArray.slice(0).sort(function (a, b) {
	    return a - b;
	  });
	  return a ? function (value, direction, threshold) {
	    if (threshold === void 0) {
	      threshold = 1e-3;
	    }

	    var i;

	    if (!direction) {
	      return snap(value);
	    }

	    if (direction > 0) {
	      value -= threshold;

	      for (i = 0; i < a.length; i++) {
	        if (a[i] >= value) {
	          return a[i];
	        }
	      }

	      return a[i - 1];
	    } else {
	      i = a.length;
	      value += threshold;

	      while (i--) {
	        if (a[i] <= value) {
	          return a[i];
	        }
	      }
	    }

	    return a[0];
	  } : function (value, direction, threshold) {
	    if (threshold === void 0) {
	      threshold = 1e-3;
	    }

	    var snapped = snap(value);
	    return !direction || Math.abs(snapped - value) < threshold || snapped - value < 0 === direction < 0 ? snapped : snap(direction < 0 ? value - snapIncrementOrArray : value + snapIncrementOrArray);
	  };
	},
	    _getLabelAtDirection = function _getLabelAtDirection(timeline) {
	  return function (value, st) {
	    return _snapDirectional(_getLabelRatioArray(timeline))(value, st.direction);
	  };
	},
	    _multiListener = function _multiListener(func, element, types, callback) {
	  return types.split(",").forEach(function (type) {
	    return func(element, type, callback);
	  });
	},
	    _addListener = function _addListener(element, type, func) {
	  return element.addEventListener(type, func, {
	    passive: true
	  });
	},
	    _removeListener = function _removeListener(element, type, func) {
	  return element.removeEventListener(type, func);
	},
	    _markerDefaults = {
	  startColor: "green",
	  endColor: "red",
	  indent: 0,
	  fontSize: "16px",
	  fontWeight: "normal"
	},
	    _defaults = {
	  toggleActions: "play",
	  anticipatePin: 0
	},
	    _keywords = {
	  top: 0,
	  left: 0,
	  center: 0.5,
	  bottom: 1,
	  right: 1
	},
	    _offsetToPx = function _offsetToPx(value, size) {
	  if (_isString(value)) {
	    var eqIndex = value.indexOf("="),
	        relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;

	    if (~eqIndex) {
	      value.indexOf("%") > eqIndex && (relative *= size / 100);
	      value = value.substr(0, eqIndex - 1);
	    }

	    value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
	  }

	  return value;
	},
	    _createMarker = function _createMarker(type, name, container, direction, _ref5, offset, matchWidthEl, containerAnimation) {
	  var startColor = _ref5.startColor,
	      endColor = _ref5.endColor,
	      fontSize = _ref5.fontSize,
	      indent = _ref5.indent,
	      fontWeight = _ref5.fontWeight;

	  var e = _doc.createElement("div"),
	      useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
	      isScroller = type.indexOf("scroller") !== -1,
	      parent = useFixedPosition ? _body : container,
	      isStart = type.indexOf("start") !== -1,
	      color = isStart ? startColor : endColor,
	      css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";

	  css += "position:" + ((isScroller || containerAnimation) && useFixedPosition ? "fixed;" : "absolute;");
	  (isScroller || containerAnimation || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
	  matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
	  e._isStart = isStart;
	  e.setAttribute("class", "gsap-marker-" + type + (name ? " marker-" + name : ""));
	  e.style.cssText = css;
	  e.innerText = name || name === 0 ? type + "-" + name : type;
	  parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
	  e._offset = e["offset" + direction.op.d2];

	  _positionMarker(e, 0, direction, isStart);

	  return e;
	},
	    _positionMarker = function _positionMarker(marker, start, direction, flipped) {
	  var vars = {
	    display: "block"
	  },
	      side = direction[flipped ? "os2" : "p2"],
	      oppositeSide = direction[flipped ? "p2" : "os2"];
	  marker._isFlipped = flipped;
	  vars[direction.a + "Percent"] = flipped ? -100 : 0;
	  vars[direction.a] = flipped ? "1px" : 0;
	  vars["border" + side + _Width] = 1;
	  vars["border" + oppositeSide + _Width] = 0;
	  vars[direction.p] = start + "px";
	  gsap.set(marker, vars);
	},
	    _triggers = [],
	    _ids = {},
	    _sync = function _sync() {
	  return _getTime() - _lastScrollTime > 34 && _updateAll();
	},
	    _onScroll = function _onScroll() {
	  _updateAll();

	  _lastScrollTime || _dispatch("scrollStart");
	  _lastScrollTime = _getTime();
	},
	    _onResize = function _onResize() {
	  return !_refreshing && !_ignoreResize && !_doc.fullscreenElement && _resizeDelay.restart(true);
	},
	    _listeners = {},
	    _emptyArray = [],
	    _media = [],
	    _creatingMedia,
	    _lastMediaTick,
	    _onMediaChange = function _onMediaChange(e) {
	  var tick = gsap.ticker.frame,
	      matches = [],
	      i = 0,
	      index;

	  if (_lastMediaTick !== tick || _startup) {
	    _revertAll();

	    for (; i < _media.length; i += 4) {
	      index = _win.matchMedia(_media[i]).matches;

	      if (index !== _media[i + 3]) {
	        _media[i + 3] = index;
	        index ? matches.push(i) : _revertAll(1, _media[i]) || _isFunction(_media[i + 2]) && _media[i + 2]();
	      }
	    }

	    _revertRecorded();

	    for (i = 0; i < matches.length; i++) {
	      index = matches[i];
	      _creatingMedia = _media[index];
	      _media[index + 2] = _media[index + 1](e);
	    }

	    _creatingMedia = 0;
	    _coreInitted && _refreshAll(0, 1);
	    _lastMediaTick = tick;

	    _dispatch("matchMedia");
	  }
	},
	    _softRefresh = function _softRefresh() {
	  return _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
	},
	    _dispatch = function _dispatch(type) {
	  return _listeners[type] && _listeners[type].map(function (f) {
	    return f();
	  }) || _emptyArray;
	},
	    _savedStyles = [],
	    _revertRecorded = function _revertRecorded(media) {
	  for (var i = 0; i < _savedStyles.length; i += 5) {
	    if (!media || _savedStyles[i + 4] === media) {
	      _savedStyles[i].style.cssText = _savedStyles[i + 1];
	      _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
	      _savedStyles[i + 3].uncache = 1;
	    }
	  }
	},
	    _revertAll = function _revertAll(kill, media) {
	  var trigger;

	  for (_i = 0; _i < _triggers.length; _i++) {
	    trigger = _triggers[_i];

	    if (!media || trigger.media === media) {
	      if (kill) {
	        trigger.kill(1);
	      } else {
	        trigger.revert();
	      }
	    }
	  }

	  media && _revertRecorded(media);
	  media || _dispatch("revert");
	},
	    _clearScrollMemory = function _clearScrollMemory() {
	  return _scrollers.forEach(function (obj) {
	    return typeof obj === "function" && (obj.rec = 0);
	  });
	},
	    _refreshingAll,
	    _refreshAll = function _refreshAll(force, skipRevert) {
	  if (_lastScrollTime && !force) {
	    _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

	    return;
	  }

	  _refreshingAll = true;

	  var refreshInits = _dispatch("refreshInit");

	  _sort && ScrollTrigger.sort();
	  skipRevert || _revertAll();

	  _triggers.forEach(function (t) {
	    return t.refresh();
	  });

	  _triggers.forEach(function (t) {
	    return t.vars.end === "max" && t.setPositions(t.start, _maxScroll(t.scroller, t._dir));
	  });

	  refreshInits.forEach(function (result) {
	    return result && result.render && result.render(-1);
	  });

	  _clearScrollMemory();

	  _resizeDelay.pause();

	  _refreshingAll = false;

	  _dispatch("refresh");
	},
	    _lastScroll = 0,
	    _direction = 1,
	    _updateAll = function _updateAll() {
	  if (!_refreshingAll) {
	    var l = _triggers.length,
	        time = _getTime(),
	        recordVelocity = time - _time1 >= 50,
	        scroll = l && _triggers[0].scroll();

	    _direction = _lastScroll > scroll ? -1 : 1;
	    _lastScroll = scroll;

	    if (recordVelocity) {
	      if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
	        _lastScrollTime = 0;

	        _dispatch("scrollEnd");
	      }

	      _time2 = _time1;
	      _time1 = time;
	    }

	    if (_direction < 0) {
	      _i = l;

	      while (_i-- > 0) {
	        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
	      }

	      _direction = 1;
	    } else {
	      for (_i = 0; _i < l; _i++) {
	        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
	      }
	    }
	  }
	},
	    _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex", "gridColumnStart", "gridColumnEnd", "gridRowStart", "gridRowEnd", "gridArea", "justifySelf", "alignSelf", "placeSelf", "order"],
	    _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
	    _swapPinOut = function _swapPinOut(pin, spacer, state) {
	  _setState(state);

	  var cache = pin._gsap;

	  if (cache.spacerIsNative) {
	    _setState(cache.spacerState);
	  } else if (pin.parentNode === spacer) {
	    var parent = spacer.parentNode;

	    if (parent) {
	      parent.insertBefore(pin, spacer);
	      parent.removeChild(spacer);
	    }
	  }
	},
	    _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
	  if (pin.parentNode !== spacer) {
	    var i = _propNamesToCopy.length,
	        spacerStyle = spacer.style,
	        pinStyle = pin.style,
	        p;

	    while (i--) {
	      p = _propNamesToCopy[i];
	      spacerStyle[p] = cs[p];
	    }

	    spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
	    cs.display === "inline" && (spacerStyle.display = "inline-block");
	    pinStyle[_bottom] = pinStyle[_right] = spacerStyle.flexBasis = "auto";
	    spacerStyle.overflow = "visible";
	    spacerStyle.boxSizing = "border-box";
	    spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
	    spacerStyle[_height] = _getSize(pin, _vertical) + _px;
	    spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";

	    _setState(spacerState);

	    pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
	    pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
	    pinStyle[_padding] = cs[_padding];
	    pin.parentNode.insertBefore(spacer, pin);
	    spacer.appendChild(pin);
	  }
	},
	    _capsExp = /([A-Z])/g,
	    _setState = function _setState(state) {
	  if (state) {
	    var style = state.t.style,
	        l = state.length,
	        i = 0,
	        p,
	        value;
	    (state.t._gsap || gsap.core.getCache(state.t)).uncache = 1;

	    for (; i < l; i += 2) {
	      value = state[i + 1];
	      p = state[i];

	      if (value) {
	        style[p] = value;
	      } else if (style[p]) {
	        style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
	      }
	    }
	  }
	},
	    _getState = function _getState(element) {
	  var l = _stateProps.length,
	      style = element.style,
	      state = [],
	      i = 0;

	  for (; i < l; i++) {
	    state.push(_stateProps[i], style[_stateProps[i]]);
	  }

	  state.t = element;
	  return state;
	},
	    _copyState = function _copyState(state, override, omitOffsets) {
	  var result = [],
	      l = state.length,
	      i = omitOffsets ? 8 : 0,
	      p;

	  for (; i < l; i += 2) {
	    p = state[i];
	    result.push(p, p in override ? override[p] : state[i + 1]);
	  }

	  result.t = state.t;
	  return result;
	},
	    _winOffsets = {
	  left: 0,
	  top: 0
	},
	    _parsePosition = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax, containerAnimation) {
	  _isFunction(value) && (value = value(self));

	  if (_isString(value) && value.substr(0, 3) === "max") {
	    value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
	  }

	  var time = containerAnimation ? containerAnimation.time() : 0,
	      p1,
	      p2,
	      element;
	  containerAnimation && containerAnimation.seek(0);

	  if (!_isNumber(value)) {
	    _isFunction(trigger) && (trigger = trigger(self));
	    var offsets = value.split(" "),
	        bounds,
	        localOffset,
	        globalOffset,
	        display;
	    element = _getTarget(trigger) || _body;
	    bounds = _getBounds(element) || {};

	    if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
	      display = element.style.display;
	      element.style.display = "block";
	      bounds = _getBounds(element);
	      display ? element.style.display = display : element.style.removeProperty("display");
	    }

	    localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
	    globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
	    value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
	    markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
	    scrollerSize -= scrollerSize - globalOffset;
	  } else if (markerScroller) {
	    _positionMarker(markerScroller, scrollerSize, direction, true);
	  }

	  if (marker) {
	    var position = value + scrollerSize,
	        isStart = marker._isStart;
	    p1 = "scroll" + direction.d2;

	    _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[p1], _docEl[p1]) : marker.parentNode[p1]) <= position + 1);

	    if (useFixedPosition) {
	      scrollerBounds = _getBounds(markerScroller);
	      useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
	    }
	  }

	  if (containerAnimation && element) {
	    p1 = _getBounds(element);
	    containerAnimation.seek(scrollerMax);
	    p2 = _getBounds(element);
	    containerAnimation._caScrollDist = p1[direction.p] - p2[direction.p];
	    value = value / containerAnimation._caScrollDist * scrollerMax;
	  }

	  containerAnimation && containerAnimation.seek(time);
	  return containerAnimation ? value : Math.round(value);
	},
	    _prefixExp = /(?:webkit|moz|length|cssText|inset)/i,
	    _reparent = function _reparent(element, parent, top, left) {
	  if (element.parentNode !== parent) {
	    var style = element.style,
	        p,
	        cs;

	    if (parent === _body) {
	      element._stOrig = style.cssText;
	      cs = _getComputedStyle(element);

	      for (p in cs) {
	        if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
	          style[p] = cs[p];
	        }
	      }

	      style.top = top;
	      style.left = left;
	    } else {
	      style.cssText = element._stOrig;
	    }

	    gsap.core.getCache(element).uncache = 1;
	    parent.appendChild(element);
	  }
	},
	    _getTweenCreator = function _getTweenCreator(scroller, direction) {
	  var getScroll = _getScrollFunc(scroller, direction),
	      prop = "_scroll" + direction.p2,
	      lastScroll1,
	      lastScroll2,
	      getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
	    var tween = getTween.tween,
	        onComplete = vars.onComplete,
	        modifiers = {};
	    tween && tween.kill();
	    lastScroll1 = Math.round(initialValue);
	    vars[prop] = scrollTo;
	    vars.modifiers = modifiers;

	    modifiers[prop] = function (value) {
	      value = _round(getScroll());

	      if (value !== lastScroll1 && value !== lastScroll2 && Math.abs(value - lastScroll1) > 2 && Math.abs(value - lastScroll2) > 2) {
	        tween.kill();
	        getTween.tween = 0;
	      } else {
	        value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
	      }

	      lastScroll2 = lastScroll1;
	      return lastScroll1 = _round(value);
	    };

	    vars.onComplete = function () {
	      getTween.tween = 0;
	      onComplete && onComplete.call(tween);
	    };

	    tween = getTween.tween = gsap.to(scroller, vars);
	    return tween;
	  };

	  scroller[prop] = getScroll;

	  _addListener(scroller, "wheel", function () {
	    return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
	  });

	  return getTween;
	};

	_horizontal.op = _vertical;
	var ScrollTrigger = function () {
	  function ScrollTrigger(vars, animation) {
	    _coreInitted || ScrollTrigger.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
	    this.init(vars, animation);
	  }

	  var _proto = ScrollTrigger.prototype;

	  _proto.init = function init(vars, animation) {
	    this.progress = this.start = 0;
	    this.vars && this.kill(1);

	    if (!_enabled) {
	      this.update = this.refresh = this.kill = _passThrough;
	      return;
	    }

	    vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
	      trigger: vars
	    } : vars, _defaults);

	    var _vars = vars,
	        onUpdate = _vars.onUpdate,
	        toggleClass = _vars.toggleClass,
	        id = _vars.id,
	        onToggle = _vars.onToggle,
	        onRefresh = _vars.onRefresh,
	        scrub = _vars.scrub,
	        trigger = _vars.trigger,
	        pin = _vars.pin,
	        pinSpacing = _vars.pinSpacing,
	        invalidateOnRefresh = _vars.invalidateOnRefresh,
	        anticipatePin = _vars.anticipatePin,
	        onScrubComplete = _vars.onScrubComplete,
	        onSnapComplete = _vars.onSnapComplete,
	        once = _vars.once,
	        snap = _vars.snap,
	        pinReparent = _vars.pinReparent,
	        pinSpacer = _vars.pinSpacer,
	        containerAnimation = _vars.containerAnimation,
	        fastScrollEnd = _vars.fastScrollEnd,
	        preventOverlaps = _vars.preventOverlaps,
	        direction = vars.horizontal || vars.containerAnimation && vars.horizontal !== false ? _horizontal : _vertical,
	        isToggle = !scrub && scrub !== 0,
	        scroller = _getTarget(vars.scroller || _win),
	        scrollerCache = gsap.core.getCache(scroller),
	        isViewport = _isViewport(scroller),
	        useFixedPosition = ("pinType" in vars ? vars.pinType : _getProxyProp(scroller, "pinType") || isViewport && "fixed") === "fixed",
	        callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
	        toggleActions = isToggle && vars.toggleActions.split(" "),
	        markers = "markers" in vars ? vars.markers : _defaults.markers,
	        borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
	        self = this,
	        onRefreshInit = vars.onRefreshInit && function () {
	      return vars.onRefreshInit(self);
	    },
	        getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
	        getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
	        lastSnap = 0,
	        scrollFunc = _getScrollFunc(scroller, direction),
	        tweenTo,
	        pinCache,
	        snapFunc,
	        scroll1,
	        scroll2,
	        start,
	        end,
	        markerStart,
	        markerEnd,
	        markerStartTrigger,
	        markerEndTrigger,
	        markerVars,
	        change,
	        pinOriginalState,
	        pinActiveState,
	        pinState,
	        spacer,
	        offset,
	        pinGetter,
	        pinSetter,
	        pinStart,
	        pinChange,
	        spacingStart,
	        spacerState,
	        markerStartSetter,
	        markerEndSetter,
	        cs,
	        snap1,
	        snap2,
	        scrubTween,
	        scrubSmooth,
	        snapDurClamp,
	        snapDelayedCall,
	        prevProgress,
	        prevScroll,
	        prevAnimProgress,
	        caMarkerSetter;

	    self.media = _creatingMedia;
	    self._dir = direction;
	    anticipatePin *= 45;
	    self.scroller = scroller;
	    self.scroll = containerAnimation ? containerAnimation.time.bind(containerAnimation) : scrollFunc;
	    scroll1 = scrollFunc();
	    self.vars = vars;
	    animation = animation || vars.animation;
	    "refreshPriority" in vars && (_sort = 1);
	    scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
	      top: _getTweenCreator(scroller, _vertical),
	      left: _getTweenCreator(scroller, _horizontal)
	    };
	    self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];

	    if (animation) {
	      animation.vars.lazy = false;
	      animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true);
	      self.animation = animation.pause();
	      animation.scrollTrigger = self;
	      scrubSmooth = _isNumber(scrub) && scrub;
	      scrubSmooth && (scrubTween = gsap.to(animation, {
	        ease: "power3",
	        duration: scrubSmooth,
	        onComplete: function onComplete() {
	          return onScrubComplete && onScrubComplete(self);
	        }
	      }));
	      snap1 = 0;
	      id || (id = animation.vars.id);
	    }

	    _triggers.push(self);

	    if (snap) {
	      if (!_isObject(snap) || snap.push) {
	        snap = {
	          snapTo: snap
	        };
	      }

	      "scrollBehavior" in _body.style && gsap.set(isViewport ? [_body, _docEl] : scroller, {
	        scrollBehavior: "auto"
	      });
	      snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getClosestLabel(animation) : snap.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : snap.directional !== false ? function (value, st) {
	        return _snapDirectional(snap.snapTo)(value, st.direction);
	      } : gsap.utils.snap(snap.snapTo);
	      snapDurClamp = snap.duration || {
	        min: 0.1,
	        max: 2
	      };
	      snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
	      snapDelayedCall = gsap.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function () {
	        if (Math.abs(self.getVelocity()) < 10 && !_pointerIsDown && lastSnap !== scrollFunc()) {
	          var totalProgress = animation && !isToggle ? animation.totalProgress() : self.progress,
	              velocity = (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0,
	              change1 = gsap.utils.clamp(-self.progress, 1 - self.progress, _abs(velocity / 2) * velocity / 0.185),
	              naturalEnd = self.progress + (snap.inertia === false ? 0 : change1),
	              endValue = _clamp(0, 1, snapFunc(naturalEnd, self)),
	              scroll = scrollFunc(),
	              endScroll = Math.round(start + endValue * change),
	              _snap = snap,
	              onStart = _snap.onStart,
	              _onInterrupt = _snap.onInterrupt,
	              _onComplete = _snap.onComplete,
	              tween = tweenTo.tween;

	          if (scroll <= end && scroll >= start && endScroll !== scroll) {
	            if (tween && !tween._initted && tween.data <= _abs(endScroll - scroll)) {
	              return;
	            }

	            if (snap.inertia === false) {
	              change1 = endValue - self.progress;
	            }

	            tweenTo(endScroll, {
	              duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
	              ease: snap.ease || "power3",
	              data: _abs(endScroll - scroll),
	              onInterrupt: function onInterrupt() {
	                return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self);
	              },
	              onComplete: function onComplete() {
	                self.update();
	                lastSnap = scrollFunc();
	                snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
	                onSnapComplete && onSnapComplete(self);
	                _onComplete && _onComplete(self);
	              }
	            }, scroll, change1 * change, endScroll - scroll - change1 * change);
	            onStart && onStart(self, tweenTo.tween);
	          }
	        } else if (self.isActive) {
	          snapDelayedCall.restart(true);
	        }
	      }).pause();
	    }

	    id && (_ids[id] = self);
	    trigger = self.trigger = _getTarget(trigger || pin);
	    pin = pin === true ? trigger : _getTarget(pin);
	    _isString(toggleClass) && (toggleClass = {
	      targets: trigger,
	      className: toggleClass
	    });

	    if (pin) {
	      pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding);
	      self.pin = pin;
	      vars.force3D !== false && gsap.set(pin, {
	        force3D: true
	      });
	      pinCache = gsap.core.getCache(pin);

	      if (!pinCache.spacer) {
	        if (pinSpacer) {
	          pinSpacer = _getTarget(pinSpacer);
	          pinSpacer && !pinSpacer.nodeType && (pinSpacer = pinSpacer.current || pinSpacer.nativeElement);
	          pinCache.spacerIsNative = !!pinSpacer;
	          pinSpacer && (pinCache.spacerState = _getState(pinSpacer));
	        }

	        pinCache.spacer = spacer = pinSpacer || _doc.createElement("div");
	        spacer.classList.add("pin-spacer");
	        id && spacer.classList.add("pin-spacer-" + id);
	        pinCache.pinState = pinOriginalState = _getState(pin);
	      } else {
	        pinOriginalState = pinCache.pinState;
	      }

	      self.spacer = spacer = pinCache.spacer;
	      cs = _getComputedStyle(pin);
	      spacingStart = cs[pinSpacing + direction.os2];
	      pinGetter = gsap.getProperty(pin);
	      pinSetter = gsap.quickSetter(pin, direction.a, _px);

	      _swapPinIn(pin, spacer, cs);

	      pinState = _getState(pin);
	    }

	    if (markers) {
	      markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
	      markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
	      markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
	      offset = markerStartTrigger["offset" + direction.op.d2];
	      markerStart = _createMarker("start", id, scroller, direction, markerVars, offset, 0, containerAnimation);
	      markerEnd = _createMarker("end", id, scroller, direction, markerVars, offset, 0, containerAnimation);
	      containerAnimation && (caMarkerSetter = gsap.quickSetter([markerStart, markerEnd], direction.a, _px));

	      if (!useFixedPosition && !(_proxies.length && _getProxyProp(scroller, "fixedMarkers") === true)) {
	        _makePositionable(isViewport ? _body : scroller);

	        gsap.set([markerStartTrigger, markerEndTrigger], {
	          force3D: true
	        });
	        markerStartSetter = gsap.quickSetter(markerStartTrigger, direction.a, _px);
	        markerEndSetter = gsap.quickSetter(markerEndTrigger, direction.a, _px);
	      }
	    }

	    if (containerAnimation) {
	      var oldOnUpdate = containerAnimation.vars.onUpdate,
	          oldParams = containerAnimation.vars.onUpdateParams;
	      containerAnimation.eventCallback("onUpdate", function () {
	        self.update(0, 0, 1);
	        oldOnUpdate && oldOnUpdate.apply(oldParams || []);
	      });
	    }

	    self.previous = function () {
	      return _triggers[_triggers.indexOf(self) - 1];
	    };

	    self.next = function () {
	      return _triggers[_triggers.indexOf(self) + 1];
	    };

	    self.revert = function (revert) {
	      var r = revert !== false || !self.enabled,
	          prevRefreshing = _refreshing;

	      if (r !== self.isReverted) {
	        if (r) {
	          self.scroll.rec || (self.scroll.rec = scrollFunc());
	          prevScroll = Math.max(scrollFunc(), self.scroll.rec || 0);
	          prevProgress = self.progress;
	          prevAnimProgress = animation && animation.progress();
	        }

	        markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
	          return m.style.display = r ? "none" : "block";
	        });
	        r && (_refreshing = 1);
	        self.update(r);
	        _refreshing = prevRefreshing;
	        pin && (r ? _swapPinOut(pin, spacer, pinOriginalState) : (!pinReparent || !self.isActive) && _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState));
	        self.isReverted = r;
	      }
	    };

	    self.refresh = function (soft, force) {
	      if ((_refreshing || !self.enabled) && !force) {
	        return;
	      }

	      if (pin && soft && _lastScrollTime) {
	        _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

	        return;
	      }

	      _refreshing = 1;
	      scrubTween && scrubTween.pause();
	      invalidateOnRefresh && animation && animation.time(-0.01, true).invalidate();
	      self.isReverted || self.revert();

	      var size = getScrollerSize(),
	          scrollerBounds = getScrollerOffsets(),
	          max = containerAnimation ? containerAnimation.duration() : _maxScroll(scroller, direction),
	          offset = 0,
	          otherPinOffset = 0,
	          parsedEnd = vars.end,
	          parsedEndTrigger = vars.endTrigger || trigger,
	          parsedStart = vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"),
	          pinnedContainer = vars.pinnedContainer && _getTarget(vars.pinnedContainer),
	          triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0,
	          i = triggerIndex,
	          cs,
	          bounds,
	          scroll,
	          isVertical,
	          override,
	          curTrigger,
	          curPin,
	          oppositeScroll,
	          initted,
	          revertedPins;

	      while (i--) {
	        curTrigger = _triggers[i];
	        curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = 1);
	        curPin = curTrigger.pin;

	        if (curPin && (curPin === trigger || curPin === pin) && !curTrigger.isReverted) {
	          revertedPins || (revertedPins = []);
	          revertedPins.unshift(curTrigger);
	          curTrigger.revert();
	        }
	      }

	      _isFunction(parsedStart) && (parsedStart = parsedStart(self));
	      start = _parsePosition(parsedStart, trigger, size, direction, scrollFunc(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation) || (pin ? -0.001 : 0);
	      _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));

	      if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
	        if (~parsedEnd.indexOf(" ")) {
	          parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
	        } else {
	          offset = _offsetToPx(parsedEnd.substr(2), size);
	          parsedEnd = _isString(parsedStart) ? parsedStart : start + offset;
	          parsedEndTrigger = trigger;
	        }
	      }

	      end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, scrollFunc() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation)) || -0.001;
	      change = end - start || (start -= 0.01) && 0.001;
	      offset = 0;
	      i = triggerIndex;

	      while (i--) {
	        curTrigger = _triggers[i];
	        curPin = curTrigger.pin;

	        if (curPin && curTrigger.start - curTrigger._pinPush < start && !containerAnimation) {
	          cs = curTrigger.end - curTrigger.start;

	          if ((curPin === trigger || curPin === pinnedContainer) && !_isNumber(parsedStart)) {
	            offset += cs * (1 - curTrigger.progress);
	          }

	          curPin === pin && (otherPinOffset += cs);
	        }
	      }

	      start += offset;
	      end += offset;
	      self._pinPush = otherPinOffset;

	      if (markerStart && offset) {
	        cs = {};
	        cs[direction.a] = "+=" + offset;
	        pinnedContainer && (cs[direction.p] = "-=" + scrollFunc());
	        gsap.set([markerStart, markerEnd], cs);
	      }

	      if (pin) {
	        cs = _getComputedStyle(pin);
	        isVertical = direction === _vertical;
	        scroll = scrollFunc();
	        pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
	        !max && end > 1 && ((isViewport ? _body : scroller).style["overflow-" + direction.a] = "scroll");

	        _swapPinIn(pin, spacer, cs);

	        pinState = _getState(pin);
	        bounds = _getBounds(pin, true);
	        oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();

	        if (pinSpacing) {
	          spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
	          spacerState.t = spacer;
	          i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
	          i && spacerState.push(direction.d, i + _px);

	          _setState(spacerState);

	          useFixedPosition && scrollFunc(prevScroll);
	        }

	        if (useFixedPosition) {
	          override = {
	            top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
	            left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
	            boxSizing: "border-box",
	            position: "fixed"
	          };
	          override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
	          override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
	          override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
	          override[_padding] = cs[_padding];
	          override[_padding + _Top] = cs[_padding + _Top];
	          override[_padding + _Right] = cs[_padding + _Right];
	          override[_padding + _Bottom] = cs[_padding + _Bottom];
	          override[_padding + _Left] = cs[_padding + _Left];
	          pinActiveState = _copyState(pinOriginalState, override, pinReparent);
	        }

	        if (animation) {
	          initted = animation._initted;

	          _suppressOverwrites(1);

	          animation.render(animation.duration(), true, true);
	          pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
	          change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2);
	          animation.render(0, true, true);
	          initted || animation.invalidate();

	          _suppressOverwrites(0);
	        } else {
	          pinChange = change;
	        }
	      } else if (trigger && scrollFunc() && !containerAnimation) {
	        bounds = trigger.parentNode;

	        while (bounds && bounds !== _body) {
	          if (bounds._pinOffset) {
	            start -= bounds._pinOffset;
	            end -= bounds._pinOffset;
	          }

	          bounds = bounds.parentNode;
	        }
	      }

	      revertedPins && revertedPins.forEach(function (t) {
	        return t.revert(false);
	      });
	      self.start = start;
	      self.end = end;
	      scroll1 = scroll2 = scrollFunc();

	      if (!containerAnimation) {
	        scroll1 < prevScroll && scrollFunc(prevScroll);
	        self.scroll.rec = 0;
	      }

	      self.revert(false);
	      _refreshing = 0;
	      animation && isToggle && animation._initted && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress, true).render(animation.time(), true, true);

	      if (prevProgress !== self.progress || containerAnimation) {
	        animation && !isToggle && animation.totalProgress(prevProgress, true);
	        self.progress = prevProgress;
	        self.update(0, 0, 1);
	      }

	      pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
	      onRefresh && onRefresh(self);
	    };

	    self.getVelocity = function () {
	      return (scrollFunc() - scroll2) / (_getTime() - _time2) * 1000 || 0;
	    };

	    self.endAnimation = function () {
	      _endAnimation(self.callbackAnimation);

	      if (animation) {
	        scrubTween ? scrubTween.progress(1) : !animation.paused() ? _endAnimation(animation, animation.reversed()) : isToggle || _endAnimation(animation, self.direction < 0, 1);
	      }
	    };

	    self.labelToScroll = function (label) {
	      return animation && animation.labels && (start || self.refresh() || start) + animation.labels[label] / animation.duration() * change || 0;
	    };

	    self.getTrailing = function (name) {
	      var i = _triggers.indexOf(self),
	          a = self.direction > 0 ? _triggers.slice(0, i).reverse() : _triggers.slice(i + 1);

	      return _isString(name) ? a.filter(function (t) {
	        return t.vars.preventOverlaps === name;
	      }) : a;
	    };

	    self.update = function (reset, recordVelocity, forceFake) {
	      if (containerAnimation && !forceFake && !reset) {
	        return;
	      }

	      var scroll = self.scroll(),
	          p = reset ? 0 : (scroll - start) / change,
	          clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
	          prevProgress = self.progress,
	          isActive,
	          wasActive,
	          toggleState,
	          action,
	          stateChanged,
	          toggled,
	          isAtMax,
	          isTakingAction;

	      if (recordVelocity) {
	        scroll2 = scroll1;
	        scroll1 = containerAnimation ? scrollFunc() : scroll;

	        if (snap) {
	          snap2 = snap1;
	          snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
	        }
	      }

	      anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 0.0001);

	      if (clipped !== prevProgress && self.enabled) {
	        isActive = self.isActive = !!clipped && clipped < 1;
	        wasActive = !!prevProgress && prevProgress < 1;
	        toggled = isActive !== wasActive;
	        stateChanged = toggled || !!clipped !== !!prevProgress;
	        self.direction = clipped > prevProgress ? 1 : -1;
	        self.progress = clipped;

	        if (stateChanged && !_refreshing) {
	          toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3;

	          if (isToggle) {
	            action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState];
	            isTakingAction = animation && (action === "complete" || action === "reset" || action in animation);
	          }
	        }

	        preventOverlaps && toggled && (isTakingAction || scrub || !animation) && (_isFunction(preventOverlaps) ? preventOverlaps(self) : self.getTrailing(preventOverlaps).forEach(function (t) {
	          return t.endAnimation();
	        }));

	        if (!isToggle) {
	          if (scrubTween && !_refreshing && !_startup) {
	            scrubTween.vars.totalProgress = clipped;
	            scrubTween.invalidate().restart();
	          } else if (animation) {
	            animation.totalProgress(clipped, !!_refreshing);
	          }
	        }

	        if (pin) {
	          reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);

	          if (!useFixedPosition) {
	            pinSetter(pinStart + pinChange * clipped);
	          } else if (stateChanged) {
	            isAtMax = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction);

	            if (pinReparent) {
	              if (!reset && (isActive || isAtMax)) {
	                var bounds = _getBounds(pin, true),
	                    _offset = scroll - start;

	                _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
	              } else {
	                _reparent(pin, spacer);
	              }
	            }

	            _setState(isActive || isAtMax ? pinActiveState : pinState);

	            pinChange !== change && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !isAtMax ? pinChange : 0));
	          }
	        }

	        snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
	        toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function (el) {
	          return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
	        });
	        onUpdate && !isToggle && !reset && onUpdate(self);

	        if (stateChanged && !_refreshing) {
	          if (isToggle) {
	            if (isTakingAction) {
	              if (action === "complete") {
	                animation.pause().totalProgress(1);
	              } else if (action === "reset") {
	                animation.restart(true).pause();
	              } else if (action === "restart") {
	                animation.restart(true);
	              } else {
	                animation[action]();
	              }
	            }

	            onUpdate && onUpdate(self);
	          }

	          if (toggled || !_limitCallbacks) {
	            onToggle && toggled && _callback(self, onToggle);
	            callbacks[toggleState] && _callback(self, callbacks[toggleState]);
	            once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0);

	            if (!toggled) {
	              toggleState = clipped === 1 ? 1 : 3;
	              callbacks[toggleState] && _callback(self, callbacks[toggleState]);
	            }
	          }

	          if (fastScrollEnd && !isActive && Math.abs(self.getVelocity()) > (_isNumber(fastScrollEnd) ? fastScrollEnd : 2500)) {
	            _endAnimation(self.callbackAnimation);

	            scrubTween ? scrubTween.progress(1) : _endAnimation(animation, !clipped, 1);
	          }
	        } else if (isToggle && onUpdate && !_refreshing) {
	          onUpdate(self);
	        }
	      }

	      if (markerEndSetter) {
	        var n = containerAnimation ? scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0) : scroll;
	        markerStartSetter(n + (markerStartTrigger._isFlipped ? 1 : 0));
	        markerEndSetter(n);
	      }

	      caMarkerSetter && caMarkerSetter(-scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0));
	    };

	    self.enable = function (reset, refresh) {
	      if (!self.enabled) {
	        self.enabled = true;

	        _addListener(scroller, "resize", _onResize);

	        _addListener(scroller, "scroll", _onScroll);

	        onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);

	        if (reset !== false) {
	          self.progress = prevProgress = 0;
	          scroll1 = scroll2 = lastSnap = scrollFunc();
	        }

	        refresh !== false && self.refresh();
	      }
	    };

	    self.getTween = function (snap) {
	      return snap && tweenTo ? tweenTo.tween : scrubTween;
	    };

	    self.setPositions = function (newStart, newEnd) {
	      if (pin) {
	        pinStart += newStart - start;
	        pinChange += newEnd - newStart - change;
	      }

	      self.start = start = newStart;
	      self.end = end = newEnd;
	      change = newEnd - newStart;
	      self.update();
	    };

	    self.disable = function (reset, allowAnimation) {
	      if (self.enabled) {
	        reset !== false && self.revert();
	        self.enabled = self.isActive = false;
	        allowAnimation || scrubTween && scrubTween.pause();
	        prevScroll = 0;
	        pinCache && (pinCache.uncache = 1);
	        onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);

	        if (snapDelayedCall) {
	          snapDelayedCall.pause();
	          tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
	        }

	        if (!isViewport) {
	          var i = _triggers.length;

	          while (i--) {
	            if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
	              return;
	            }
	          }

	          _removeListener(scroller, "resize", _onResize);

	          _removeListener(scroller, "scroll", _onScroll);
	        }
	      }
	    };

	    self.kill = function (revert, allowAnimation) {
	      self.disable(revert, allowAnimation);
	      scrubTween && scrubTween.kill();
	      id && delete _ids[id];

	      var i = _triggers.indexOf(self);

	      i >= 0 && _triggers.splice(i, 1);
	      i === _i && _direction > 0 && _i--;
	      i = 0;

	      _triggers.forEach(function (t) {
	        return t.scroller === self.scroller && (i = 1);
	      });

	      i || (self.scroll.rec = 0);

	      if (animation) {
	        animation.scrollTrigger = null;
	        revert && animation.render(-1);
	        allowAnimation || animation.kill();
	      }

	      markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
	        return m.parentNode && m.parentNode.removeChild(m);
	      });

	      if (pin) {
	        pinCache && (pinCache.uncache = 1);
	        i = 0;

	        _triggers.forEach(function (t) {
	          return t.pin === pin && i++;
	        });

	        i || (pinCache.spacer = 0);
	      }
	    };

	    self.enable(false, false);
	    !animation || !animation.add || change ? self.refresh() : gsap.delayedCall(0.01, function () {
	      return start || end || self.refresh();
	    }) && (change = 0.01) && (start = end = 0);
	  };

	  ScrollTrigger.register = function register(core) {
	    if (!_coreInitted) {
	      gsap = core || _getGSAP();

	      if (_windowExists() && window.document) {
	        _win = window;
	        _doc = document;
	        _docEl = _doc.documentElement;
	        _body = _doc.body;
	      }

	      if (gsap) {
	        _toArray = gsap.utils.toArray;
	        _clamp = gsap.utils.clamp;
	        _suppressOverwrites = gsap.core.suppressOverwrites || _passThrough;
	        gsap.core.globals("ScrollTrigger", ScrollTrigger);

	        if (_body) {
	          _addListener(_win, "wheel", _onScroll);

	          _root = [_win, _doc, _docEl, _body];

	          _addListener(_doc, "scroll", _onScroll);

	          var bodyStyle = _body.style,
	              border = bodyStyle.borderTopStyle,
	              bounds;
	          bodyStyle.borderTopStyle = "solid";
	          bounds = _getBounds(_body);
	          _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0;
	          _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
	          border ? bodyStyle.borderTopStyle = border : bodyStyle.removeProperty("border-top-style");
	          _syncInterval = setInterval(_sync, 200);
	          gsap.delayedCall(0.5, function () {
	            return _startup = 0;
	          });

	          _addListener(_doc, "touchcancel", _passThrough);

	          _addListener(_body, "touchstart", _passThrough);

	          _multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", function () {
	            return _pointerIsDown = 1;
	          });

	          _multiListener(_addListener, _doc, "pointerup,touchend,mouseup", function () {
	            return _pointerIsDown = 0;
	          });

	          _transformProp = gsap.utils.checkPrefix("transform");

	          _stateProps.push(_transformProp);

	          _coreInitted = _getTime();
	          _resizeDelay = gsap.delayedCall(0.2, _refreshAll).pause();
	          _autoRefresh = [_doc, "visibilitychange", function () {
	            var w = _win.innerWidth,
	                h = _win.innerHeight;

	            if (_doc.hidden) {
	              _prevWidth = w;
	              _prevHeight = h;
	            } else if (_prevWidth !== w || _prevHeight !== h) {
	              _onResize();
	            }
	          }, _doc, "DOMContentLoaded", _refreshAll, _win, "load", function () {
	            return _lastScrollTime || _refreshAll();
	          }, _win, "resize", _onResize];

	          _iterateAutoRefresh(_addListener);
	        }
	      }
	    }

	    return _coreInitted;
	  };

	  ScrollTrigger.defaults = function defaults(config) {
	    if (config) {
	      for (var p in config) {
	        _defaults[p] = config[p];
	      }
	    }

	    return _defaults;
	  };

	  ScrollTrigger.kill = function kill() {
	    _enabled = 0;

	    _triggers.slice(0).forEach(function (trigger) {
	      return trigger.kill(1);
	    });
	  };

	  ScrollTrigger.config = function config(vars) {
	    "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
	    var ms = vars.syncInterval;
	    ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);

	    if ("autoRefreshEvents" in vars) {
	      _iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none");
	      _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
	    }
	  };

	  ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
	    var t = _getTarget(target),
	        i = _scrollers.indexOf(t),
	        isViewport = _isViewport(t);

	    if (~i) {
	      _scrollers.splice(i, isViewport ? 6 : 2);
	    }

	    if (vars) {
	      isViewport ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
	    }
	  };

	  ScrollTrigger.matchMedia = function matchMedia(vars) {
	    var mq, p, i, func, result;

	    for (p in vars) {
	      i = _media.indexOf(p);
	      func = vars[p];
	      _creatingMedia = p;

	      if (p === "all") {
	        func();
	      } else {
	        mq = _win.matchMedia(p);

	        if (mq) {
	          mq.matches && (result = func());

	          if (~i) {
	            _media[i + 1] = _combineFunc(_media[i + 1], func);
	            _media[i + 2] = _combineFunc(_media[i + 2], result);
	          } else {
	            i = _media.length;

	            _media.push(p, func, result);

	            mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
	          }

	          _media[i + 3] = mq.matches;
	        }
	      }

	      _creatingMedia = 0;
	    }

	    return _media;
	  };

	  ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
	    query || (_media.length = 0);
	    query = _media.indexOf(query);
	    query >= 0 && _media.splice(query, 4);
	  };

	  ScrollTrigger.isInViewport = function isInViewport(element, ratio, horizontal) {
	    var bounds = (_isString(element) ? _getTarget(element) : element).getBoundingClientRect(),
	        offset = bounds[horizontal ? _width : _height] * ratio || 0;
	    return horizontal ? bounds.right - offset > 0 && bounds.left + offset < _win.innerWidth : bounds.bottom - offset > 0 && bounds.top + offset < _win.innerHeight;
	  };

	  ScrollTrigger.positionInViewport = function positionInViewport(element, referencePoint, horizontal) {
	    _isString(element) && (element = _getTarget(element));
	    var bounds = element.getBoundingClientRect(),
	        size = bounds[horizontal ? _width : _height],
	        offset = referencePoint == null ? size / 2 : referencePoint in _keywords ? _keywords[referencePoint] * size : ~referencePoint.indexOf("%") ? parseFloat(referencePoint) * size / 100 : parseFloat(referencePoint) || 0;
	    return horizontal ? (bounds.left + offset) / _win.innerWidth : (bounds.top + offset) / _win.innerHeight;
	  };

	  return ScrollTrigger;
	}();
	ScrollTrigger.version = "3.9.1";

	ScrollTrigger.saveStyles = function (targets) {
	  return targets ? _toArray(targets).forEach(function (target) {
	    if (target && target.style) {
	      var i = _savedStyles.indexOf(target);

	      i >= 0 && _savedStyles.splice(i, 5);

	      _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), gsap.core.getCache(target), _creatingMedia);
	    }
	  }) : _savedStyles;
	};

	ScrollTrigger.revert = function (soft, media) {
	  return _revertAll(!soft, media);
	};

	ScrollTrigger.create = function (vars, animation) {
	  return new ScrollTrigger(vars, animation);
	};

	ScrollTrigger.refresh = function (safe) {
	  return safe ? _onResize() : (_coreInitted || ScrollTrigger.register()) && _refreshAll(true);
	};

	ScrollTrigger.update = _updateAll;
	ScrollTrigger.clearScrollMemory = _clearScrollMemory;

	ScrollTrigger.maxScroll = function (element, horizontal) {
	  return _maxScroll(element, horizontal ? _horizontal : _vertical);
	};

	ScrollTrigger.getScrollFunc = function (element, horizontal) {
	  return _getScrollFunc(_getTarget(element), horizontal ? _horizontal : _vertical);
	};

	ScrollTrigger.getById = function (id) {
	  return _ids[id];
	};

	ScrollTrigger.getAll = function () {
	  return _triggers.slice(0);
	};

	ScrollTrigger.isScrolling = function () {
	  return !!_lastScrollTime;
	};

	ScrollTrigger.snapDirectional = _snapDirectional;

	ScrollTrigger.addEventListener = function (type, callback) {
	  var a = _listeners[type] || (_listeners[type] = []);
	  ~a.indexOf(callback) || a.push(callback);
	};

	ScrollTrigger.removeEventListener = function (type, callback) {
	  var a = _listeners[type],
	      i = a && a.indexOf(callback);
	  i >= 0 && a.splice(i, 1);
	};

	ScrollTrigger.batch = function (targets, vars) {
	  var result = [],
	      varsCopy = {},
	      interval = vars.interval || 0.016,
	      batchMax = vars.batchMax || 1e9,
	      proxyCallback = function proxyCallback(type, callback) {
	    var elements = [],
	        triggers = [],
	        delay = gsap.delayedCall(interval, function () {
	      callback(elements, triggers);
	      elements = [];
	      triggers = [];
	    }).pause();
	    return function (self) {
	      elements.length || delay.restart(true);
	      elements.push(self.trigger);
	      triggers.push(self);
	      batchMax <= elements.length && delay.progress(1);
	    };
	  },
	      p;

	  for (p in vars) {
	    varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
	  }

	  if (_isFunction(batchMax)) {
	    batchMax = batchMax();

	    _addListener(ScrollTrigger, "refresh", function () {
	      return batchMax = vars.batchMax();
	    });
	  }

	  _toArray(targets).forEach(function (target) {
	    var config = {};

	    for (p in varsCopy) {
	      config[p] = varsCopy[p];
	    }

	    config.trigger = target;
	    result.push(ScrollTrigger.create(config));
	  });

	  return result;
	};

	ScrollTrigger.sort = function (func) {
	  return _triggers.sort(func || function (a, b) {
	    return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
	  });
	};

	_getGSAP() && gsap.registerPlugin(ScrollTrigger);

	exports.ScrollTrigger = ScrollTrigger;
	exports.default = ScrollTrigger;

	Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.window = global.window || {}));
}(this, (function (exports) { 'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  /*!
   * GSAP 3.9.1
   * https://greensock.com
   *
   * @license Copyright 2008-2021, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var _config = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: {
      lineHeight: ""
    }
  },
      _defaults = {
    duration: .5,
    overwrite: false,
    delay: 0
  },
      _suppressOverwrites,
      _bigNum = 1e8,
      _tinyNum = 1 / _bigNum,
      _2PI = Math.PI * 2,
      _HALF_PI = _2PI / 4,
      _gsID = 0,
      _sqrt = Math.sqrt,
      _cos = Math.cos,
      _sin = Math.sin,
      _isString = function _isString(value) {
    return typeof value === "string";
  },
      _isFunction = function _isFunction(value) {
    return typeof value === "function";
  },
      _isNumber = function _isNumber(value) {
    return typeof value === "number";
  },
      _isUndefined = function _isUndefined(value) {
    return typeof value === "undefined";
  },
      _isObject = function _isObject(value) {
    return typeof value === "object";
  },
      _isNotFalse = function _isNotFalse(value) {
    return value !== false;
  },
      _windowExists = function _windowExists() {
    return typeof window !== "undefined";
  },
      _isFuncOrString = function _isFuncOrString(value) {
    return _isFunction(value) || _isString(value);
  },
      _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
      _isArray = Array.isArray,
      _strictNumExp = /(?:-?\.?\d|\.)+/gi,
      _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
      _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
      _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
      _relExp = /[+-]=-?[.\d]+/,
      _delimitedValueExp = /[^,'"\[\]\s]+/gi,
      _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i,
      _globalTimeline,
      _win,
      _coreInitted,
      _doc,
      _globals = {},
      _installScope = {},
      _coreReady,
      _install = function _install(scope) {
    return (_installScope = _merge(scope, _globals)) && gsap;
  },
      _missingPlugin = function _missingPlugin(property, value) {
    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
  },
      _warn = function _warn(message, suppress) {
    return !suppress && console.warn(message);
  },
      _addGlobal = function _addGlobal(name, obj) {
    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
  },
      _emptyFunc = function _emptyFunc() {
    return 0;
  },
      _reservedProps = {},
      _lazyTweens = [],
      _lazyLookup = {},
      _lastRenderedFrame,
      _plugins = {},
      _effects = {},
      _nextGCFrame = 30,
      _harnessPlugins = [],
      _callbackNames = "",
      _harness = function _harness(targets) {
    var target = targets[0],
        harnessPlugin,
        i;
    _isObject(target) || _isFunction(target) || (targets = [targets]);

    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i = _harnessPlugins.length;

      while (i-- && !_harnessPlugins[i].targetTest(target)) {}

      harnessPlugin = _harnessPlugins[i];
    }

    i = targets.length;

    while (i--) {
      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
    }

    return targets;
  },
      _getCache = function _getCache(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  },
      _getProperty = function _getProperty(target, property, v) {
    return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
  },
      _forEachName = function _forEachName(names, func) {
    return (names = names.split(",")).forEach(func) || names;
  },
      _round = function _round(value) {
    return Math.round(value * 100000) / 100000 || 0;
  },
      _roundPrecise = function _roundPrecise(value) {
    return Math.round(value * 10000000) / 10000000 || 0;
  },
      _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
    var l = toFind.length,
        i = 0;

    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

    return i < l;
  },
      _lazyRender = function _lazyRender() {
    var l = _lazyTweens.length,
        a = _lazyTweens.slice(0),
        i,
        tween;

    _lazyLookup = {};
    _lazyTweens.length = 0;

    for (i = 0; i < l; i++) {
      tween = a[i];
      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  },
      _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
    _lazyTweens.length && _lazyRender();
    animation.render(time, suppressEvents, force);
    _lazyTweens.length && _lazyRender();
  },
      _numericIfPossible = function _numericIfPossible(value) {
    var n = parseFloat(value);
    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
  },
      _passThrough = function _passThrough(p) {
    return p;
  },
      _setDefaults = function _setDefaults(obj, defaults) {
    for (var p in defaults) {
      p in obj || (obj[p] = defaults[p]);
    }

    return obj;
  },
      _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
    return function (obj, defaults) {
      for (var p in defaults) {
        p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
      }
    };
  },
      _merge = function _merge(base, toMerge) {
    for (var p in toMerge) {
      base[p] = toMerge[p];
    }

    return base;
  },
      _mergeDeep = function _mergeDeep(base, toMerge) {
    for (var p in toMerge) {
      p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
    }

    return base;
  },
      _copyExcluding = function _copyExcluding(obj, excluding) {
    var copy = {},
        p;

    for (p in obj) {
      p in excluding || (copy[p] = obj[p]);
    }

    return copy;
  },
      _inheritDefaults = function _inheritDefaults(vars) {
    var parent = vars.parent || _globalTimeline,
        func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;

    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }

    return vars;
  },
      _arraysMatch = function _arraysMatch(a1, a2) {
    var i = a1.length,
        match = i === a2.length;

    while (match && i-- && a1[i] === a2[i]) {}

    return i < 0;
  },
      _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }

    if (lastProp === void 0) {
      lastProp = "_last";
    }

    var prev = parent[lastProp],
        t;

    if (sortBy) {
      t = child[sortBy];

      while (prev && prev[sortBy] > t) {
        prev = prev._prev;
      }
    }

    if (prev) {
      child._next = prev._next;
      prev._next = child;
    } else {
      child._next = parent[firstProp];
      parent[firstProp] = child;
    }

    if (child._next) {
      child._next._prev = child;
    } else {
      parent[lastProp] = child;
    }

    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
  },
      _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }

    if (lastProp === void 0) {
      lastProp = "_last";
    }

    var prev = child._prev,
        next = child._next;

    if (prev) {
      prev._next = next;
    } else if (parent[firstProp] === child) {
      parent[firstProp] = next;
    }

    if (next) {
      next._prev = prev;
    } else if (parent[lastProp] === child) {
      parent[lastProp] = prev;
    }

    child._next = child._prev = child.parent = null;
  },
      _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
    child._act = 0;
  },
      _uncache = function _uncache(animation, child) {
    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
      var a = animation;

      while (a) {
        a._dirty = 1;
        a = a.parent;
      }
    }

    return animation;
  },
      _recacheAncestors = function _recacheAncestors(animation) {
    var parent = animation.parent;

    while (parent && parent.parent) {
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }

    return animation;
  },
      _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
    return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
  },
      _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
  },
      _animationCycle = function _animationCycle(tTime, cycleDuration) {
    var whole = Math.floor(tTime /= cycleDuration);
    return tTime && whole === tTime ? whole - 1 : whole;
  },
      _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
  },
      _setEnd = function _setEnd(animation) {
    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
  },
      _alignPlayhead = function _alignPlayhead(animation, totalTime) {
    var parent = animation._dp;

    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

      _setEnd(animation);

      parent._dirty || _uncache(parent, animation);
    }

    return animation;
  },
      _postAddChecks = function _postAddChecks(timeline, child) {
    var t;

    if (child._time || child._initted && !child._dur) {
      t = _parentToChildTotalTime(timeline.rawTime(), child);

      if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
        child.render(t, true);
      }
    }

    if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
      if (timeline._dur < timeline.duration()) {
        t = timeline;

        while (t._dp) {
          t.rawTime() >= 0 && t.totalTime(t._tTime);
          t = t._dp;
        }
      }

      timeline._zTime = -_tinyNum;
    }
  },
      _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
    child.parent && _removeFromParent(child);
    child._start = _roundPrecise((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

    _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

    _isFromOrFromStart(child) || (timeline._recent = child);
    skipChecks || _postAddChecks(timeline, child);
    return timeline;
  },
      _scrollTrigger = function _scrollTrigger(animation, trigger) {
    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
  },
      _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
    _initTween(tween, totalTime);

    if (!tween._initted) {
      return 1;
    }

    if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
      _lazyTweens.push(tween);

      tween._lazy = [totalTime, suppressEvents];
      return 1;
    }
  },
      _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
    var parent = _ref.parent;
    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
  },
      _isFromOrFromStart = function _isFromOrFromStart(_ref2) {
    var data = _ref2.data;
    return data === "isFromStart" || data === "isStart";
  },
      _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
    var prevRatio = tween.ratio,
        ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1,
        repeatDelay = tween._rDelay,
        tTime = 0,
        pt,
        iteration,
        prevIteration;

    if (repeatDelay && tween._repeat) {
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);

      if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }

    if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
        return;
      }

      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
      suppressEvents || (suppressEvents = totalTime && !prevIteration);
      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      pt = tween._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
        ratio && _removeFromParent(tween, 1);

        if (!suppressEvents) {
          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  },
      _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
    var child;

    if (time > prevTime) {
      child = animation._first;

      while (child && child._start <= time) {
        if (child.data === "isPause" && child._start > prevTime) {
          return child;
        }

        child = child._next;
      }
    } else {
      child = animation._last;

      while (child && child._start >= time) {
        if (child.data === "isPause" && child._start < prevTime) {
          return child;
        }

        child = child._prev;
      }
    }
  },
      _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
    var repeat = animation._repeat,
        dur = _roundPrecise(duration) || 0,
        totalProgress = animation._tTime / animation._tDur;
    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress > 0 && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  },
      _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
  },
      _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc,
    totalDuration: _emptyFunc
  },
      _parsePosition = function _parsePosition(animation, position, percentAnimation) {
    var labels = animation.labels,
        recent = animation._recent || _zeroPosition,
        clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
        i,
        offset,
        isPercent;

    if (_isString(position) && (isNaN(position) || position in labels)) {
      offset = position.charAt(0);
      isPercent = position.substr(-1) === "%";
      i = position.indexOf("=");

      if (offset === "<" || offset === ">") {
        i >= 0 && (position = position.replace(/=/, ""));
        return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
      }

      if (i < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }

      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));

      if (isPercent && percentAnimation) {
        offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
      }

      return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
    }

    return position == null ? clippedDuration : +position;
  },
      _createTweenType = function _createTweenType(type, params, timeline) {
    var isLegacy = _isNumber(params[1]),
        varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
        vars = params[varsIndex],
        irVars,
        parent;

    isLegacy && (vars.duration = params[1]);
    vars.parent = timeline;

    if (type) {
      irVars = vars;
      parent = timeline;

      while (parent && !("immediateRender" in irVars)) {
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }

      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
    }

    return new Tween(params[0], vars, params[varsIndex + 1]);
  },
      _conditionalReturn = function _conditionalReturn(value, func) {
    return value || value === 0 ? func(value) : func;
  },
      _clamp = function _clamp(min, max, value) {
    return value < min ? min : value > max ? max : value;
  },
      getUnit = function getUnit(value, v) {
    return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : value.substr(v.index + v[0].length);
  },
      clamp = function clamp(min, max, value) {
    return _conditionalReturn(value, function (v) {
      return _clamp(min, max, v);
    });
  },
      _slice = [].slice,
      _isArrayLike = function _isArrayLike(value, nonEmpty) {
    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
  },
      _flatten = function _flatten(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }

    return ar.forEach(function (value) {
      var _accumulator;

      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
    }) || accumulator;
  },
      toArray = function toArray(value, scope, leaveStrings) {
    return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
  },
      selector = function selector(value) {
    value = toArray(value)[0] || _warn("Invalid scope") || {};
    return function (v) {
      var el = value.current || value.nativeElement || value;
      return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
    };
  },
      shuffle = function shuffle(a) {
    return a.sort(function () {
      return .5 - Math.random();
    });
  },
      distribute = function distribute(v) {
    if (_isFunction(v)) {
      return v;
    }

    var vars = _isObject(v) ? v : {
      each: v
    },
        ease = _parseEase(vars.ease),
        from = vars.from || 0,
        base = parseFloat(vars.base) || 0,
        cache = {},
        isDecimal = from > 0 && from < 1,
        ratios = isNaN(from) || isDecimal,
        axis = vars.axis,
        ratioX = from,
        ratioY = from;

    if (_isString(from)) {
      ratioX = ratioY = {
        center: .5,
        edges: .5,
        end: 1
      }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }

    return function (i, target, a) {
      var l = (a || vars).length,
          distances = cache[l],
          originX,
          originY,
          x,
          y,
          d,
          j,
          max,
          min,
          wrapAt;

      if (!distances) {
        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

        if (!wrapAt) {
          max = -_bigNum;

          while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

          wrapAt--;
        }

        distances = cache[l] = [];
        originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
        originY = wrapAt === _bigNum ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
        max = 0;
        min = _bigNum;

        for (j = 0; j < l; j++) {
          x = j % wrapAt - originX;
          y = originY - (j / wrapAt | 0);
          distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
          d > max && (max = d);
          d < min && (min = d);
        }

        from === "random" && shuffle(distances);
        distances.max = max - min;
        distances.min = min;
        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
        distances.b = l < 0 ? base - l : base;
        distances.u = getUnit(vars.amount || vars.each) || 0;
        ease = ease && l < 0 ? _invertEase(ease) : ease;
      }

      l = (distances[i] - distances.min) / distances.max || 0;
      return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
    };
  },
      _roundModifier = function _roundModifier(v) {
    var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
    return function (raw) {
      var n = Math.round(parseFloat(raw) / v) * v * p;
      return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
    };
  },
      snap = function snap(snapTo, value) {
    var isArray = _isArray(snapTo),
        radius,
        is2D;

    if (!isArray && _isObject(snapTo)) {
      radius = isArray = snapTo.radius || _bigNum;

      if (snapTo.values) {
        snapTo = toArray(snapTo.values);

        if (is2D = !_isNumber(snapTo[0])) {
          radius *= radius;
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }

    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
      is2D = snapTo(raw);
      return Math.abs(is2D - raw) <= radius ? is2D : raw;
    } : function (raw) {
      var x = parseFloat(is2D ? raw.x : raw),
          y = parseFloat(is2D ? raw.y : 0),
          min = _bigNum,
          closest = 0,
          i = snapTo.length,
          dx,
          dy;

      while (i--) {
        if (is2D) {
          dx = snapTo[i].x - x;
          dy = snapTo[i].y - y;
          dx = dx * dx + dy * dy;
        } else {
          dx = Math.abs(snapTo[i] - x);
        }

        if (dx < min) {
          min = dx;
          closest = i;
        }
      }

      closest = !radius || min <= radius ? snapTo[closest] : raw;
      return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
    });
  },
      random = function random(min, max, roundingIncrement, returnFunction) {
    return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
    });
  },
      pipe = function pipe() {
    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
      functions[_key] = arguments[_key];
    }

    return function (value) {
      return functions.reduce(function (v, f) {
        return f(v);
      }, value);
    };
  },
      unitize = function unitize(func, unit) {
    return function (value) {
      return func(parseFloat(value)) + (unit || getUnit(value));
    };
  },
      normalize = function normalize(min, max, value) {
    return mapRange(min, max, 0, 1, value);
  },
      _wrapArray = function _wrapArray(a, wrapper, value) {
    return _conditionalReturn(value, function (index) {
      return a[~~wrapper(index)];
    });
  },
      wrap = function wrap(min, max, value) {
    var range = max - min;
    return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
      return (range + (value - min) % range) % range + min;
    });
  },
      wrapYoyo = function wrapYoyo(min, max, value) {
    var range = max - min,
        total = range * 2;
    return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
      value = (total + (value - min) % total) % total || 0;
      return min + (value > range ? total - value : value);
    });
  },
      _replaceRandom = function _replaceRandom(value) {
    var prev = 0,
        s = "",
        i,
        nums,
        end,
        isArray;

    while (~(i = value.indexOf("random(", prev))) {
      end = value.indexOf(")", i);
      isArray = value.charAt(i + 7) === "[";
      nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
      s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
      prev = end + 1;
    }

    return s + value.substr(prev, value.length - prev);
  },
      mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin,
        outRange = outMax - outMin;
    return _conditionalReturn(value, function (value) {
      return outMin + ((value - inMin) / inRange * outRange || 0);
    });
  },
      interpolate = function interpolate(start, end, progress, mutate) {
    var func = isNaN(start + end) ? 0 : function (p) {
      return (1 - p) * start + p * end;
    };

    if (!func) {
      var isString = _isString(start),
          master = {},
          p,
          i,
          interpolators,
          l,
          il;

      progress === true && (mutate = 1) && (progress = null);

      if (isString) {
        start = {
          p: start
        };
        end = {
          p: end
        };
      } else if (_isArray(start) && !_isArray(end)) {
        interpolators = [];
        l = start.length;
        il = l - 2;

        for (i = 1; i < l; i++) {
          interpolators.push(interpolate(start[i - 1], start[i]));
        }

        l--;

        func = function func(p) {
          p *= l;
          var i = Math.min(il, ~~p);
          return interpolators[i](p - i);
        };

        progress = end;
      } else if (!mutate) {
        start = _merge(_isArray(start) ? [] : {}, start);
      }

      if (!interpolators) {
        for (p in end) {
          _addPropTween.call(master, start, p, "get", end[p]);
        }

        func = function func(p) {
          return _renderPropTweens(p, master) || (isString ? start.p : start);
        };
      }
    }

    return _conditionalReturn(progress, func);
  },
      _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
    var labels = timeline.labels,
        min = _bigNum,
        p,
        distance,
        label;

    for (p in labels) {
      distance = labels[p] - fromTime;

      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
        label = p;
        min = distance;
      }
    }

    return label;
  },
      _callback = function _callback(animation, type, executeLazyFirst) {
    var v = animation.vars,
        callback = v[type],
        params,
        scope;

    if (!callback) {
      return;
    }

    params = v[type + "Params"];
    scope = v.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender();
    return params ? callback.apply(scope, params) : callback.call(scope);
  },
      _interrupt = function _interrupt(animation) {
    _removeFromParent(animation);

    animation.scrollTrigger && animation.scrollTrigger.kill(false);
    animation.progress() < 1 && _callback(animation, "onInterrupt");
    return animation;
  },
      _quickTween,
      _createPlugin = function _createPlugin(config) {
    config = !config.name && config["default"] || config;

    var name = config.name,
        isFunc = _isFunction(config),
        Plugin = name && !isFunc && config.init ? function () {
      this._props = [];
    } : config,
        instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    },
        statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };

    _wake();

    if (config !== Plugin) {
      if (_plugins[name]) {
        return;
      }

      _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics));

      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics)));

      _plugins[Plugin.prop = name] = Plugin;

      if (config.targetTest) {
        _harnessPlugins.push(Plugin);

        _reservedProps[name] = 1;
      }

      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }

    _addGlobal(name, Plugin);

    config.register && config.register(gsap, Plugin, PropTween);
  },
      _255 = 255,
      _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0]
  },
      _hue = function _hue(h, m1, m2) {
    h += h < 0 ? 1 : h > 1 ? -1 : 0;
    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
  },
      splitColor = function splitColor(v, toHSL, forceAlpha) {
    var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
        r,
        g,
        b,
        h,
        s,
        l,
        max,
        min,
        d,
        wasHSL;

    if (!a) {
      if (v.substr(-1) === ",") {
        v = v.substr(0, v.length - 1);
      }

      if (_colorLookup[v]) {
        a = _colorLookup[v];
      } else if (v.charAt(0) === "#") {
        if (v.length < 6) {
          r = v.charAt(1);
          g = v.charAt(2);
          b = v.charAt(3);
          v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
        }

        if (v.length === 9) {
          a = parseInt(v.substr(1, 6), 16);
          return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
        }

        v = parseInt(v.substr(1), 16);
        a = [v >> 16, v >> 8 & _255, v & _255];
      } else if (v.substr(0, 3) === "hsl") {
        a = wasHSL = v.match(_strictNumExp);

        if (!toHSL) {
          h = +a[0] % 360 / 360;
          s = +a[1] / 100;
          l = +a[2] / 100;
          g = l <= .5 ? l * (s + 1) : l + s - l * s;
          r = l * 2 - g;
          a.length > 3 && (a[3] *= 1);
          a[0] = _hue(h + 1 / 3, r, g);
          a[1] = _hue(h, r, g);
          a[2] = _hue(h - 1 / 3, r, g);
        } else if (~v.indexOf("=")) {
          a = v.match(_numExp);
          forceAlpha && a.length < 4 && (a[3] = 1);
          return a;
        }
      } else {
        a = v.match(_strictNumExp) || _colorLookup.transparent;
      }

      a = a.map(Number);
    }

    if (toHSL && !wasHSL) {
      r = a[0] / _255;
      g = a[1] / _255;
      b = a[2] / _255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60;
      }

      a[0] = ~~(h + .5);
      a[1] = ~~(s * 100 + .5);
      a[2] = ~~(l * 100 + .5);
    }

    forceAlpha && a.length < 4 && (a[3] = 1);
    return a;
  },
      _colorOrderData = function _colorOrderData(v) {
    var values = [],
        c = [],
        i = -1;
    v.split(_colorExp).forEach(function (v) {
      var a = v.match(_numWithUnitExp) || [];
      values.push.apply(values, a);
      c.push(i += a.length + 1);
    });
    values.c = c;
    return values;
  },
      _formatColors = function _formatColors(s, toHSL, orderMatchData) {
    var result = "",
        colors = (s + result).match(_colorExp),
        type = toHSL ? "hsla(" : "rgba(",
        i = 0,
        c,
        shell,
        d,
        l;

    if (!colors) {
      return s;
    }

    colors = colors.map(function (color) {
      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
    });

    if (orderMatchData) {
      d = _colorOrderData(s);
      c = orderMatchData.c;

      if (c.join(result) !== d.c.join(result)) {
        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
        l = shell.length - 1;

        for (; i < l; i++) {
          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
        }
      }
    }

    if (!shell) {
      shell = s.split(_colorExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + colors[i];
      }
    }

    return result + shell[l];
  },
      _colorExp = function () {
    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
        p;

    for (p in _colorLookup) {
      s += "|" + p + "\\b";
    }

    return new RegExp(s + ")", "gi");
  }(),
      _hslExp = /hsl[a]?\(/,
      _colorStringFilter = function _colorStringFilter(a) {
    var combined = a.join(" "),
        toHSL;
    _colorExp.lastIndex = 0;

    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a[1] = _formatColors(a[1], toHSL);
      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
      return true;
    }
  },
      _tickerActive,
      _ticker = function () {
    var _getTime = Date.now,
        _lagThreshold = 500,
        _adjustedLag = 33,
        _startTime = _getTime(),
        _lastUpdate = _startTime,
        _gap = 1000 / 240,
        _nextTime = _gap,
        _listeners = [],
        _id,
        _req,
        _raf,
        _self,
        _delta,
        _i,
        _tick = function _tick(v) {
      var elapsed = _getTime() - _lastUpdate,
          manual = v === true,
          overlap,
          dispatch,
          time,
          frame;

      elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
      _lastUpdate += elapsed;
      time = _lastUpdate - _startTime;
      overlap = time - _nextTime;

      if (overlap > 0 || manual) {
        frame = ++_self.frame;
        _delta = time - _self.time * 1000;
        _self.time = time = time / 1000;
        _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
        dispatch = 1;
      }

      manual || (_id = _req(_tick));

      if (dispatch) {
        for (_i = 0; _i < _listeners.length; _i++) {
          _listeners[_i](time, _delta, frame, v);
        }
      }
    };

    _self = {
      time: 0,
      frame: 0,
      tick: function tick() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1000 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted && _windowExists()) {
            _win = _coreInitted = window;
            _doc = _win.document || {};
            _globals.gsap = gsap;
            (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

            _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

            _raf = _win.requestAnimationFrame;
          }

          _id && _self.sleep();

          _req = _raf || function (f) {
            return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
          };

          _tickerActive = 1;

          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || 1 / _tinyNum;
        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
      },
      fps: function fps(_fps) {
        _gap = 1000 / (_fps || 240);
        _nextTime = _self.time * 1000 + _gap;
      },
      add: function add(callback) {
        _listeners.indexOf(callback) < 0 && _listeners.push(callback);

        _wake();
      },
      remove: function remove(callback, i) {
        ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
      },
      _listeners: _listeners
    };
    return _self;
  }(),
      _wake = function _wake() {
    return !_tickerActive && _ticker.wake();
  },
      _easeMap = {},
      _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
      _quotesExp = /["']/g,
      _parseObjectInString = function _parseObjectInString(value) {
    var obj = {},
        split = value.substr(1, value.length - 3).split(":"),
        key = split[0],
        i = 1,
        l = split.length,
        index,
        val,
        parsedVal;

    for (; i < l; i++) {
      val = split[i];
      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
      parsedVal = val.substr(0, index);
      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
      key = val.substr(index + 1).trim();
    }

    return obj;
  },
      _valueInParentheses = function _valueInParentheses(value) {
    var open = value.indexOf("(") + 1,
        close = value.indexOf(")"),
        nested = value.indexOf("(", open);
    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
  },
      _configEaseFromString = function _configEaseFromString(name) {
    var split = (name + "").split("("),
        ease = _easeMap[split[0]];
    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
  },
      _invertEase = function _invertEase(ease) {
    return function (p) {
      return 1 - ease(1 - p);
    };
  },
      _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
    var child = timeline._first,
        ease;

    while (child) {
      if (child instanceof Timeline) {
        _propagateYoyoEase(child, isYoyo);
      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
        if (child.timeline) {
          _propagateYoyoEase(child.timeline, isYoyo);
        } else {
          ease = child._ease;
          child._ease = child._yEase;
          child._yEase = ease;
          child._yoyo = isYoyo;
        }
      }

      child = child._next;
    }
  },
      _parseEase = function _parseEase(ease, defaultEase) {
    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  },
      _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut(p) {
        return 1 - easeIn(1 - p);
      };
    }

    if (easeInOut === void 0) {
      easeInOut = function easeInOut(p) {
        return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
      };
    }

    var ease = {
      easeIn: easeIn,
      easeOut: easeOut,
      easeInOut: easeInOut
    },
        lowercaseName;

    _forEachName(names, function (name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

      for (var p in ease) {
        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
      }
    });

    return ease;
  },
      _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
    return function (p) {
      return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
    };
  },
      _configElastic = function _configElastic(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1,
        p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
        p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
        easeOut = function easeOut(p) {
      return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
    },
        ease = type === "out" ? easeOut : type === "in" ? function (p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);

    p2 = _2PI / p2;

    ease.config = function (amplitude, period) {
      return _configElastic(type, amplitude, period);
    };

    return ease;
  },
      _configBack = function _configBack(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }

    var easeOut = function easeOut(p) {
      return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
    },
        ease = type === "out" ? easeOut : type === "in" ? function (p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);

    ease.config = function (overshoot) {
      return _configBack(type, overshoot);
    };

    return ease;
  };

  _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
    var power = i < 5 ? i + 1 : i;

    _insertEase(name + ",Power" + (power - 1), i ? function (p) {
      return Math.pow(p, power);
    } : function (p) {
      return p;
    }, function (p) {
      return 1 - Math.pow(1 - p, power);
    }, function (p) {
      return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
    });
  });

  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

  _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

  (function (n, c) {
    var n1 = 1 / c,
        n2 = 2 * n1,
        n3 = 2.5 * n1,
        easeOut = function easeOut(p) {
      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
    };

    _insertEase("Bounce", function (p) {
      return 1 - easeOut(1 - p);
    }, easeOut);
  })(7.5625, 2.75);

  _insertEase("Expo", function (p) {
    return p ? Math.pow(2, 10 * (p - 1)) : 0;
  });

  _insertEase("Circ", function (p) {
    return -(_sqrt(1 - p * p) - 1);
  });

  _insertEase("Sine", function (p) {
    return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
  });

  _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

  _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
    config: function config(steps, immediateStart) {
      if (steps === void 0) {
        steps = 1;
      }

      var p1 = 1 / steps,
          p2 = steps + (immediateStart ? 0 : 1),
          p3 = immediateStart ? 1 : 0,
          max = 1 - _tinyNum;
      return function (p) {
        return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
      };
    }
  };
  _defaults.ease = _easeMap["quad.out"];

  _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
    return _callbackNames += name + "," + name + "Params,";
  });

  var GSCache = function GSCache(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  var Animation = function () {
    function Animation(vars) {
      this.vars = vars;
      this._delay = +vars.delay || 0;

      if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }

      this._ts = 1;

      _setDuration(this, +vars.duration, 1, 1);

      this.data = vars.data;
      _tickerActive || _ticker.wake();
    }

    var _proto = Animation.prototype;

    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }

      return this._delay;
    };

    _proto.duration = function duration(value) {
      return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
    };

    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }

      this._dirty = 0;
      return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
    };

    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();

      if (!arguments.length) {
        return this._tTime;
      }

      var parent = this._dp;

      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime);

        !parent._dp || parent.parent || _postAddChecks(parent, this);

        while (parent && parent.parent) {
          if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
            parent.totalTime(parent._tTime, true);
          }

          parent = parent.parent;
        }

        if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }

      if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
        this._ts || (this._pTime = _totalTime);

        _lazySafeRender(this, _totalTime, suppressEvents);
      }

      return this;
    };

    _proto.time = function time(value, suppressEvents) {
      return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
    };

    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
    };

    _proto.progress = function progress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
    };

    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;

      return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
    };

    _proto.timeScale = function timeScale(value) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts;
      }

      if (this._rts === value) {
        return this;
      }

      var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;

      _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));

      _setEnd(this);

      return this;
    };

    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }

      if (this._ps !== value) {
        this._ps = value;

        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
          this._ts = this._act = 0;
        } else {
          _wake();

          this._ts = this._rts;
          this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
        }
      }

      return this;
    };

    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = value;
        var parent = this.parent || this._dp;
        parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
        return this;
      }

      return this._start;
    };

    _proto.endTime = function endTime(includeRepeats) {
      return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
    };

    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp;
      return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };

    _proto.globalTime = function globalTime(rawTime) {
      var animation = this,
          time = arguments.length ? rawTime : animation.rawTime();

      while (animation) {
        time = animation._start + time / (animation._ts || 1);
        animation = animation._dp;
      }

      return time;
    };

    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value === Infinity ? -2 : value;
        return _onUpdateTotalDuration(this);
      }

      return this._repeat === -2 ? Infinity : this._repeat;
    };

    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        var time = this._time;
        this._rDelay = value;

        _onUpdateTotalDuration(this);

        return time ? this.time(time) : this;
      }

      return this._rDelay;
    };

    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }

      return this._yoyo;
    };

    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
    };

    _proto.restart = function restart(includeDelay, suppressEvents) {
      return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    };

    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };

    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };

    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };

    _proto.resume = function resume() {
      return this.paused(false);
    };

    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
        return this;
      }

      return this._rts < 0;
    };

    _proto.invalidate = function invalidate() {
      this._initted = this._act = 0;
      this._zTime = -_tinyNum;
      return this;
    };

    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp,
          start = this._start,
          rawTime;
      return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
    };

    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;

      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + "Params"] = params);
          type === "onUpdate" && (this._onUpdate = callback);
        }

        return this;
      }

      return vars[type];
    };

    _proto.then = function then(onFulfilled) {
      var self = this;
      return new Promise(function (resolve) {
        var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
            _resolve = function _resolve() {
          var _then = self.then;
          self.then = null;
          _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
          resolve(f);
          self.then = _then;
        };

        if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
          _resolve();
        } else {
          self._prom = _resolve;
        }
      });
    };

    _proto.kill = function kill() {
      _interrupt(this);
    };

    return Animation;
  }();

  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1
  });

  var Timeline = function (_Animation) {
    _inheritsLoose(Timeline, _Animation);

    function Timeline(vars, position) {
      var _this;

      if (vars === void 0) {
        vars = {};
      }

      _this = _Animation.call(this, vars) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
      vars.reversed && _this.reverse();
      vars.paused && _this.paused(true);
      vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
      return _this;
    }

    var _proto2 = Timeline.prototype;

    _proto2.to = function to(targets, vars, position) {
      _createTweenType(0, arguments, this);

      return this;
    };

    _proto2.from = function from(targets, vars, position) {
      _createTweenType(1, arguments, this);

      return this;
    };

    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      _createTweenType(2, arguments, this);

      return this;
    };

    _proto2.set = function set(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };

    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
    };

    _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };

    _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
      return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
    };

    _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
      return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
    };

    _proto2.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time,
          tDur = this._dirty ? this.totalDuration() : this._tDur,
          dur = this._dur,
          tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime),
          crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
          time,
          child,
          next,
          iteration,
          cycleDuration,
          prevPaused,
          pauseTween,
          timeScale,
          prevStart,
          prevIteration,
          yoyo,
          isYoyo;
      this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);

      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }

        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;

        if (crossingStart) {
          dur || (prevTime = this._zTime);
          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }

        if (this._repeat) {
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;

          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }

          time = _roundPrecise(tTime % cycleDuration);

          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);

            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }

            time > dur && (time = dur);
          }

          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration);

          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }

          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1,
                doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : dur;
            this._lock = 1;
            this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
            this._tTime = tTime;
            !suppressEvents && this.parent && _callback(this, "onRepeat");
            this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

            if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
              return this;
            }

            dur = this._dur;
            tDur = this._tDur;

            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -0.0001;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }

            this._lock = 0;

            if (!this._ts && !prevPaused) {
              return this;
            }

            _propagateYoyoEase(this, isYoyo);
          }
        }

        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));

          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }

        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale;

        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
          prevTime = 0;
        }

        if (!prevTime && time && !suppressEvents) {
          _callback(this, "onStart");

          if (this._tTime !== tTime) {
            return this;
          }
        }

        if (time >= prevTime && totalTime >= 0) {
          child = this._first;

          while (child) {
            next = child._next;

            if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }

              child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = -_tinyNum);
                break;
              }
            }

            child = next;
          }
        } else {
          child = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time;

          while (child) {
            next = child._prev;

            if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }

              child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                break;
              }
            }

            child = next;
          }
        }

        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

          if (this._ts) {
            this._start = prevStart;

            _setEnd(this);

            return this.render(totalTime, suppressEvents, force);
          }
        }

        this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
        if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
          (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);

          if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
            _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);

            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }

      return this;
    };

    _proto2.add = function add(child, position) {
      var _this2 = this;

      _isNumber(position) || (position = _parsePosition(this, position, child));

      if (!(child instanceof Animation)) {
        if (_isArray(child)) {
          child.forEach(function (obj) {
            return _this2.add(obj, position);
          });
          return this;
        }

        if (_isString(child)) {
          return this.addLabel(child, position);
        }

        if (_isFunction(child)) {
          child = Tween.delayedCall(0, child);
        } else {
          return this;
        }
      }

      return this !== child ? _addToTimeline(this, child, position) : this;
    };

    _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
      if (nested === void 0) {
        nested = true;
      }

      if (tweens === void 0) {
        tweens = true;
      }

      if (timelines === void 0) {
        timelines = true;
      }

      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum;
      }

      var a = [],
          child = this._first;

      while (child) {
        if (child._start >= ignoreBeforeTime) {
          if (child instanceof Tween) {
            tweens && a.push(child);
          } else {
            timelines && a.push(child);
            nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
          }
        }

        child = child._next;
      }

      return a;
    };

    _proto2.getById = function getById(id) {
      var animations = this.getChildren(1, 1, 1),
          i = animations.length;

      while (i--) {
        if (animations[i].vars.id === id) {
          return animations[i];
        }
      }
    };

    _proto2.remove = function remove(child) {
      if (_isString(child)) {
        return this.removeLabel(child);
      }

      if (_isFunction(child)) {
        return this.killTweensOf(child);
      }

      _removeLinkedListItem(this, child);

      if (child === this._recent) {
        this._recent = this._last;
      }

      return _uncache(this);
    };

    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }

      this._forcing = 1;

      if (!this._dp && this._ts) {
        this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
      }

      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

      this._forcing = 0;
      return this;
    };

    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };

    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };

    _proto2.addPause = function addPause(position, callback, params) {
      var t = Tween.delayedCall(0, callback || _emptyFunc, params);
      t.data = "isPause";
      this._hasPause = 1;
      return _addToTimeline(this, t, _parsePosition(this, position));
    };

    _proto2.removePause = function removePause(position) {
      var child = this._first;
      position = _parsePosition(this, position);

      while (child) {
        if (child._start === position && child.data === "isPause") {
          _removeFromParent(child);
        }

        child = child._next;
      }
    };

    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive),
          i = tweens.length;

      while (i--) {
        _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
      }

      return this;
    };

    _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
      var a = [],
          parsedTargets = toArray(targets),
          child = this._first,
          isGlobalTime = _isNumber(onlyActive),
          children;

      while (child) {
        if (child instanceof Tween) {
          if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
            a.push(child);
          }
        } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
          a.push.apply(a, children);
        }

        child = child._next;
      }

      return a;
    };

    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};

      var tl = this,
          endTime = _parsePosition(tl, position),
          _vars = vars,
          startAt = _vars.startAt,
          _onStart = _vars.onStart,
          onStartParams = _vars.onStartParams,
          immediateRender = _vars.immediateRender,
          initted,
          tween = Tween.to(tl, _setDefaults({
        ease: vars.ease || "none",
        lazy: false,
        immediateRender: false,
        time: endTime,
        overwrite: "auto",
        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
        onStart: function onStart() {
          tl.pause();

          if (!initted) {
            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            initted = 1;
          }

          _onStart && _onStart.apply(tween, onStartParams || []);
        }
      }, vars));

      return immediateRender ? tween.render(0) : tween;
    };

    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(toPosition, _setDefaults({
        startAt: {
          time: _parsePosition(this, fromPosition)
        }
      }, vars));
    };

    _proto2.recent = function recent() {
      return this._recent;
    };

    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }

      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };

    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }

      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };

    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
    };

    _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }

      var child = this._first,
          labels = this.labels,
          p;

      while (child) {
        if (child._start >= ignoreBeforeTime) {
          child._start += amount;
          child._end += amount;
        }

        child = child._next;
      }

      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }

      return _uncache(this);
    };

    _proto2.invalidate = function invalidate() {
      var child = this._first;
      this._lock = 0;

      while (child) {
        child.invalidate();
        child = child._next;
      }

      return _Animation.prototype.invalidate.call(this);
    };

    _proto2.clear = function clear(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }

      var child = this._first,
          next;

      while (child) {
        next = child._next;
        this.remove(child);
        child = next;
      }

      this._dp && (this._time = this._tTime = this._pTime = 0);
      includeLabels && (this.labels = {});
      return _uncache(this);
    };

    _proto2.totalDuration = function totalDuration(value) {
      var max = 0,
          self = this,
          child = self._last,
          prevStart = _bigNum,
          prev,
          start,
          parent;

      if (arguments.length) {
        return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
      }

      if (self._dirty) {
        parent = self.parent;

        while (child) {
          prev = child._prev;
          child._dirty && child.totalDuration();
          start = child._start;

          if (start > prevStart && self._sort && child._ts && !self._lock) {
            self._lock = 1;
            _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
          } else {
            prevStart = start;
          }

          if (start < 0 && child._ts) {
            max -= start;

            if (!parent && !self._dp || parent && parent.smoothChildTiming) {
              self._start += start / self._ts;
              self._time -= start;
              self._tTime -= start;
            }

            self.shiftChildren(-start, false, -1e999);
            prevStart = 0;
          }

          child._end > max && child._ts && (max = child._end);
          child = prev;
        }

        _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

        self._dirty = 0;
      }

      return self._tDur;
    };

    Timeline.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

        _lastRenderedFrame = _ticker.frame;
      }

      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child = _globalTimeline._first;
        if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }

          child || _ticker.sleep();
        }
      }
    };

    return Timeline;
  }(Animation);

  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0
  });

  var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
        index = 0,
        matchIndex = 0,
        result,
        startNums,
        color,
        endNum,
        chunk,
        startNum,
        hasRandom,
        a;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";

    if (hasRandom = ~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (stringFilter) {
      a = [start, end];
      stringFilter(a, target, prop);
      start = a[0];
      end = a[1];
    }

    startNums = start.match(_complexStringNumExp) || [];

    while (result = _complexStringNumExp.exec(end)) {
      endNum = result[0];
      chunk = end.substring(index, result.index);

      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(") {
        color = 1;
      }

      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0;
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          s: startNum,
          c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
          m: color && color < 4 ? Math.round : 0
        };
        index = _complexStringNumExp.lastIndex;
      }
    }

    pt.c = index < end.length ? end.substring(index, end.length) : "";
    pt.fp = funcParam;

    if (_relExp.test(end) || hasRandom) {
      pt.e = 0;
    }

    this._pt = pt;
    return pt;
  },
      _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
    _isFunction(end) && (end = end(index || 0, target, targets));
    var currentValue = target[prop],
        parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
        setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
        pt;

    if (_isString(end)) {
      if (~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }

      if (end.charAt(1) === "=") {
        pt = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);

        if (pt || pt === 0) {
          end = pt;
        }
      }
    }

    if (parsedStart !== end) {
      if (!isNaN(parsedStart * end) && end !== "") {
        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return this._pt = pt;
      }

      !currentValue && !(prop in target) && _missingPlugin(prop, end);
      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
    }
  },
      _processVars = function _processVars(vars, index, target, targets, tween) {
    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
    }

    var copy = {},
        p;

    for (p in vars) {
      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
    }

    return copy;
  },
      _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
    var plugin, pt, ptLookup, i;

    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
        i = plugin._props.length;

        while (i--) {
          ptLookup[plugin._props[i]] = pt;
        }
      }
    }

    return plugin;
  },
      _overwritingTween,
      _initTween = function _initTween(tween, time) {
    var vars = tween.vars,
        ease = vars.ease,
        startAt = vars.startAt,
        immediateRender = vars.immediateRender,
        lazy = vars.lazy,
        onUpdate = vars.onUpdate,
        onUpdateParams = vars.onUpdateParams,
        callbackScope = vars.callbackScope,
        runBackwards = vars.runBackwards,
        yoyoEase = vars.yoyoEase,
        keyframes = vars.keyframes,
        autoRevert = vars.autoRevert,
        dur = tween._dur,
        prevStartAt = tween._startAt,
        targets = tween._targets,
        parent = tween.parent,
        fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
        autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites,
        tl = tween.timeline,
        cleanVars,
        i,
        p,
        pt,
        target,
        hasPriority,
        gsData,
        harness,
        plugin,
        ptLookup,
        index,
        harnessVars,
        overwritten;
    tl && (!keyframes || !ease) && (ease = "none");
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

    if (yoyoEase && tween._yoyo && !tween._repeat) {
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }

    tween._from = !tl && !!vars.runBackwards;

    if (!tl || keyframes && !vars.stagger) {
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop];
      cleanVars = _copyExcluding(vars, _reservedProps);
      prevStartAt && _removeFromParent(prevStartAt.render(-1, true));

      if (startAt) {
        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
          data: "isStart",
          overwrite: false,
          parent: parent,
          immediateRender: true,
          lazy: _isNotFalse(lazy),
          startAt: null,
          delay: 0,
          onUpdate: onUpdate,
          onUpdateParams: onUpdateParams,
          callbackScope: callbackScope,
          stagger: 0
        }, startAt)));

        time < 0 && !immediateRender && !autoRevert && tween._startAt.render(-1, true);

        if (immediateRender) {
          time > 0 && !autoRevert && (tween._startAt = 0);

          if (dur && time <= 0) {
            time && (tween._zTime = time);
            return;
          }
        } else if (autoRevert === false) {
          tween._startAt = 0;
        }
      } else if (runBackwards && dur) {
        if (prevStartAt) {
          !autoRevert && (tween._startAt = 0);
        } else {
          time && (immediateRender = false);
          p = _setDefaults({
            overwrite: false,
            data: "isFromStart",
            lazy: immediateRender && _isNotFalse(lazy),
            immediateRender: immediateRender,
            stagger: 0,
            parent: parent
          }, cleanVars);
          harnessVars && (p[harness.prop] = harnessVars);

          _removeFromParent(tween._startAt = Tween.set(targets, p));

          time < 0 && tween._startAt.render(-1, true);
          tween._zTime = time;

          if (!immediateRender) {
            _initTween(tween._startAt, _tinyNum);
          } else if (!time) {
            return;
          }
        }
      }

      tween._pt = 0;
      lazy = dur && _isNotFalse(lazy) || lazy && !dur;

      for (i = 0; i < targets.length; i++) {
        target = targets[i];
        gsData = target._gsap || _harness(targets)[i]._gsap;
        tween._ptLookup[i] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
        index = fullTargets === targets ? i : fullTargets.indexOf(target);

        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

          plugin._props.forEach(function (name) {
            ptLookup[name] = pt;
          });

          plugin.priority && (hasPriority = 1);
        }

        if (!harness || harnessVars) {
          for (p in cleanVars) {
            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
              plugin.priority && (hasPriority = 1);
            } else {
              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
            }
          }
        }

        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;

          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));

          overwritten = !tween.parent;
          _overwritingTween = 0;
        }

        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }

      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween);
    }

    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten;
    keyframes && time <= 0 && tl.render(_bigNum, true, true);
  },
      _addAliasesToVars = function _addAliasesToVars(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0,
        propertyAliases = harness && harness.aliases,
        copy,
        p,
        i,
        aliases;

    if (!propertyAliases) {
      return vars;
    }

    copy = _merge({}, vars);

    for (p in propertyAliases) {
      if (p in copy) {
        aliases = propertyAliases[p].split(",");
        i = aliases.length;

        while (i--) {
          copy[aliases[i]] = copy[p];
        }
      }
    }

    return copy;
  },
      _parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
    var ease = obj.ease || easeEach || "power1.inOut",
        p,
        a;

    if (_isArray(obj)) {
      a = allProps[prop] || (allProps[prop] = []);
      obj.forEach(function (value, i) {
        return a.push({
          t: i / (obj.length - 1) * 100,
          v: value,
          e: ease
        });
      });
    } else {
      for (p in obj) {
        a = allProps[p] || (allProps[p] = []);
        p === "ease" || a.push({
          t: parseFloat(prop),
          v: obj[p],
          e: ease
        });
      }
    }
  },
      _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
    return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
  },
      _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
      _staggerPropsToSkip = {};

  _forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function (name) {
    return _staggerPropsToSkip[name] = 1;
  });

  var Tween = function (_Animation2) {
    _inheritsLoose(Tween, _Animation2);

    function Tween(targets, vars, position, skipInherit) {
      var _this3;

      if (typeof vars === "number") {
        position.duration = vars;
        vars = position;
        position = null;
      }

      _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
      var _this3$vars = _this3.vars,
          duration = _this3$vars.duration,
          delay = _this3$vars.delay,
          immediateRender = _this3$vars.immediateRender,
          stagger = _this3$vars.stagger,
          overwrite = _this3$vars.overwrite,
          keyframes = _this3$vars.keyframes,
          defaults = _this3$vars.defaults,
          scrollTrigger = _this3$vars.scrollTrigger,
          yoyoEase = _this3$vars.yoyoEase,
          parent = vars.parent || _globalTimeline,
          parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
          tl,
          i,
          copy,
          l,
          p,
          curTarget,
          staggerFunc,
          staggerVarsToMerge;
      _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
      _this3._ptLookup = [];
      _this3._overwrite = overwrite;

      if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: "nested",
          defaults: defaults || {}
        });
        tl.kill();
        tl.parent = tl._dp = _assertThisInitialized(_this3);
        tl._start = 0;

        if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          l = parsedTargets.length;
          staggerFunc = stagger && distribute(stagger);

          if (_isObject(stagger)) {
            for (p in stagger) {
              if (~_staggerTweenProps.indexOf(p)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p] = stagger[p];
              }
            }
          }

          for (i = 0; i < l; i++) {
            copy = _copyExcluding(vars, _staggerPropsToSkip);
            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i];
            copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
            copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

            if (!stagger && l === 1 && copy.delay) {
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }

            tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
            tl._ease = _easeMap.none;
          }

          tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
        } else if (keyframes) {
          _inheritDefaults(_setDefaults(tl.vars.defaults, {
            ease: "none"
          }));

          tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
          var time = 0,
              a,
              kf,
              v;

          if (_isArray(keyframes)) {
            keyframes.forEach(function (frame) {
              return tl.to(parsedTargets, frame, ">");
            });
          } else {
            copy = {};

            for (p in keyframes) {
              p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
            }

            for (p in copy) {
              a = copy[p].sort(function (a, b) {
                return a.t - b.t;
              });
              time = 0;

              for (i = 0; i < a.length; i++) {
                kf = a[i];
                v = {
                  ease: kf.e,
                  duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
                };
                v[p] = kf.v;
                tl.to(parsedTargets, v, time);
                time += v.duration;
              }
            }

            tl.duration() < duration && tl.to({}, {
              duration: duration - tl.duration()
            });
          }
        }

        duration || _this3.duration(duration = tl.duration());
      } else {
        _this3.timeline = 0;
      }

      if (overwrite === true && !_suppressOverwrites) {
        _overwritingTween = _assertThisInitialized(_this3);

        _globalTimeline.killTweensOf(parsedTargets);

        _overwritingTween = 0;
      }

      _addToTimeline(parent, _assertThisInitialized(_this3), position);

      vars.reversed && _this3.reverse();
      vars.paused && _this3.paused(true);

      if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
        _this3._tTime = -_tinyNum;

        _this3.render(Math.max(0, -delay));
      }

      scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
      return _this3;
    }

    var _proto3 = Tween.prototype;

    _proto3.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time,
          tDur = this._tDur,
          dur = this._dur,
          tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
          time,
          pt,
          iteration,
          cycleDuration,
          prevIteration,
          isYoyo,
          ratio,
          timeline,
          yoyoEase;

      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== totalTime < 0) {
        time = tTime;
        timeline = this.timeline;

        if (this._repeat) {
          cycleDuration = dur + this._rDelay;

          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }

          time = _roundPrecise(tTime % cycleDuration);

          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);

            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }

            time > dur && (time = dur);
          }

          isYoyo = this._yoyo && iteration & 1;

          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }

          prevIteration = _animationCycle(this._tTime, cycleDuration);

          if (time === prevTime && !force && this._initted) {
            return this;
          }

          if (iteration !== prevIteration) {
            timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo);

            if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
              this._lock = force = 1;
              this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
            }
          }
        }

        if (!this._initted) {
          if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
            this._tTime = 0;
            return this;
          }

          if (dur !== this._dur) {
            return this.render(totalTime, suppressEvents, force);
          }
        }

        this._tTime = tTime;
        this._time = time;

        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }

        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }

        if (time && !prevTime && !suppressEvents) {
          _callback(this, "onStart");

          if (this._tTime !== tTime) {
            return this;
          }
        }

        pt = this._pt;

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);

        if (this._onUpdate && !suppressEvents) {
          totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force);

          _callback(this, "onUpdate");
        }

        this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
          (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);

          if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }

      return this;
    };

    _proto3.targets = function targets() {
      return this._targets;
    };

    _proto3.invalidate = function invalidate() {
      this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate();
      return _Animation2.prototype.invalidate.call(this);
    };

    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = "all";
      }

      if (!targets && (!vars || vars === "all")) {
        this._lazy = this._pt = 0;
        return this.parent ? _interrupt(this) : this;
      }

      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
        this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
        return this;
      }

      var parsedTargets = this._targets,
          killingTargets = targets ? toArray(targets) : parsedTargets,
          propTweenLookup = this._ptLookup,
          firstPT = this._pt,
          overwrittenProps,
          curLookup,
          curOverwriteProps,
          props,
          p,
          pt,
          i;

      if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
        vars === "all" && (this._pt = 0);
        return _interrupt(this);
      }

      overwrittenProps = this._op = this._op || [];

      if (vars !== "all") {
        if (_isString(vars)) {
          p = {};

          _forEachName(vars, function (name) {
            return p[name] = 1;
          });

          vars = p;
        }

        vars = _addAliasesToVars(parsedTargets, vars);
      }

      i = parsedTargets.length;

      while (i--) {
        if (~killingTargets.indexOf(parsedTargets[i])) {
          curLookup = propTweenLookup[i];

          if (vars === "all") {
            overwrittenProps[i] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
            props = vars;
          }

          for (p in props) {
            pt = curLookup && curLookup[p];

            if (pt) {
              if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                _removeLinkedListItem(this, pt, "_pt");
              }

              delete curLookup[p];
            }

            if (curOverwriteProps !== "all") {
              curOverwriteProps[p] = 1;
            }
          }
        }
      }

      this._initted && !this._pt && firstPT && _interrupt(this);
      return this;
    };

    Tween.to = function to(targets, vars) {
      return new Tween(targets, vars, arguments[2]);
    };

    Tween.from = function from(targets, vars) {
      return _createTweenType(1, arguments);
    };

    Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
      return new Tween(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay: delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope
      });
    };

    Tween.fromTo = function fromTo(targets, fromVars, toVars) {
      return _createTweenType(2, arguments);
    };

    Tween.set = function set(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween(targets, vars);
    };

    Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };

    return Tween;
  }(Animation);

  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0
  });

  _forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
    Tween[name] = function () {
      var tl = new Timeline(),
          params = _slice.call(arguments, 0);

      params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });

  var _setterPlain = function _setterPlain(target, property, value) {
    return target[property] = value;
  },
      _setterFunc = function _setterFunc(target, property, value) {
    return target[property](value);
  },
      _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
    return target[property](data.fp, value);
  },
      _setterAttribute = function _setterAttribute(target, property, value) {
    return target.setAttribute(property, value);
  },
      _getSetter = function _getSetter(target, property) {
    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
  },
      _renderPlain = function _renderPlain(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1000000) / 1000000, data);
  },
      _renderBoolean = function _renderBoolean(ratio, data) {
    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
  },
      _renderComplexString = function _renderComplexString(ratio, data) {
    var pt = data._pt,
        s = "";

    if (!ratio && data.b) {
      s = data.b;
    } else if (ratio === 1 && data.e) {
      s = data.e;
    } else {
      while (pt) {
        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s;
        pt = pt._next;
      }

      s += data.c;
    }

    data.set(data.t, data.p, s, data);
  },
      _renderPropTweens = function _renderPropTweens(ratio, data) {
    var pt = data._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  },
      _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
    var pt = this._pt,
        next;

    while (pt) {
      next = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next;
    }
  },
      _killPropTweensOf = function _killPropTweensOf(property) {
    var pt = this._pt,
        hasNonDependentRemaining,
        next;

    while (pt) {
      next = pt._next;

      if (pt.p === property && !pt.op || pt.op === property) {
        _removeLinkedListItem(this, pt, "_pt");
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }

      pt = next;
    }

    return !hasNonDependentRemaining;
  },
      _setterWithModifier = function _setterWithModifier(target, property, value, data) {
    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
  },
      _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
    var pt = parent._pt,
        next,
        pt2,
        first,
        last;

    while (pt) {
      next = pt._next;
      pt2 = first;

      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }

      if (pt._prev = pt2 ? pt2._prev : last) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }

      if (pt._next = pt2) {
        pt2._prev = pt;
      } else {
        last = pt;
      }

      pt = next;
    }

    parent._pt = first;
  };

  var PropTween = function () {
    function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
      this.t = target;
      this.s = start;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next;

      if (next) {
        next._prev = this;
      }
    }

    var _proto4 = PropTween.prototype;

    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set;
      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target;
      this.tween = tween;
    };

    return PropTween;
  }();

  _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
    return _reservedProps[name] = 1;
  });

  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: "root",
    smoothChildTiming: true
  });
  _config.stringFilter = _colorStringFilter;
  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args.forEach(function (config) {
        return _createPlugin(config);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit, uncache) {
      _isString(target) && (target = toArray(target)[0]);

      var getter = _getCache(target || {}).get,
          format = unit ? _passThrough : _numericIfPossible;

      unit === "native" && (unit = "");
      return !target ? target : !property ? function (property, unit, uncache) {
        return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
      } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    },
    quickSetter: function quickSetter(target, property, unit) {
      target = toArray(target);

      if (target.length > 1) {
        var setters = target.map(function (t) {
          return gsap.quickSetter(t, property, unit);
        }),
            l = setters.length;
        return function (value) {
          var i = l;

          while (i--) {
            setters[i](value);
          }
        };
      }

      target = target[0] || {};

      var Plugin = _plugins[property],
          cache = _getCache(target),
          p = cache.harness && (cache.harness.aliases || {})[property] || property,
          setter = Plugin ? function (value) {
        var p = new Plugin();
        _quickTween._pt = 0;
        p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
        p.render(1, p);
        _quickTween._pt && _renderPropTweens(1, _quickTween);
      } : cache.set(target, p);

      return Plugin ? setter : function (value) {
        return setter(target, p, unit ? value + unit : value, cache, 1);
      };
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults(value) {
      value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref3) {
      var name = _ref3.name,
          effect = _ref3.effect,
          plugins = _ref3.plugins,
          defaults = _ref3.defaults,
          extendTimeline = _ref3.extendTimeline;
      (plugins || "").split(",").forEach(function (pluginName) {
        return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
      });

      _effects[name] = function (targets, vars, tl) {
        return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
      };

      if (extendTimeline) {
        Timeline.prototype[name] = function (targets, vars, position) {
          return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }

      var tl = new Timeline(vars),
          child,
          next;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

      _globalTimeline.remove(tl);

      tl._dp = 0;
      tl._time = tl._tTime = _globalTimeline._time;
      child = _globalTimeline._first;

      while (child) {
        next = child._next;

        if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
          _addToTimeline(tl, child, child._start - child._delay);
        }

        child = next;
      }

      _addToTimeline(_globalTimeline, tl, 0);

      return tl;
    },
    utils: {
      wrap: wrap,
      wrapYoyo: wrapYoyo,
      distribute: distribute,
      random: random,
      snap: snap,
      normalize: normalize,
      getUnit: getUnit,
      clamp: clamp,
      splitColor: splitColor,
      toArray: toArray,
      selector: selector,
      mapRange: mapRange,
      pipe: pipe,
      unitize: unitize,
      interpolate: interpolate,
      shuffle: shuffle
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween: PropTween,
      globals: _addGlobal,
      Tween: Tween,
      Timeline: Timeline,
      Animation: Animation,
      getCache: _getCache,
      _removeLinkedListItem: _removeLinkedListItem,
      suppressOverwrites: function suppressOverwrites(value) {
        return _suppressOverwrites = value;
      }
    }
  };

  _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
    return _gsap[name] = Tween[name];
  });

  _ticker.add(Timeline.updateRoot);

  _quickTween = _gsap.to({}, {
    duration: 0
  });

  var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
    var pt = plugin._pt;

    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }

    return pt;
  },
      _addModifiers = function _addModifiers(tween, modifiers) {
    var targets = tween._targets,
        p,
        i,
        pt;

    for (p in modifiers) {
      i = targets.length;

      while (i--) {
        pt = tween._ptLookup[i][p];

        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            pt = _getPluginPropTween(pt, p);
          }

          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
        }
      }
    }
  },
      _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
    return {
      name: name,
      rawVars: 1,
      init: function init(target, vars, tween) {
        tween._onInit = function (tween) {
          var temp, p;

          if (_isString(vars)) {
            temp = {};

            _forEachName(vars, function (name) {
              return temp[name] = 1;
            });

            vars = temp;
          }

          if (modifier) {
            temp = {};

            for (p in vars) {
              temp[p] = modifier(vars[p]);
            }

            vars = temp;
          }

          _addModifiers(tween, vars);
        };
      }
    };
  };

  var gsap = _gsap.registerPlugin({
    name: "attr",
    init: function init(target, vars, tween, index, targets) {
      var p, pt;

      for (p in vars) {
        pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
        pt && (pt.op = p);

        this._props.push(p);
      }
    }
  }, {
    name: "endArray",
    init: function init(target, value) {
      var i = value.length;

      while (i--) {
        this.add(target, i, target[i] || 0, value[i]);
      }
    }
  }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
  Tween.version = Timeline.version = gsap.version = "3.9.1";
  _coreReady = 1;
  _windowExists() && _wake();
  var Power0 = _easeMap.Power0,
      Power1 = _easeMap.Power1,
      Power2 = _easeMap.Power2,
      Power3 = _easeMap.Power3,
      Power4 = _easeMap.Power4,
      Linear = _easeMap.Linear,
      Quad = _easeMap.Quad,
      Cubic = _easeMap.Cubic,
      Quart = _easeMap.Quart,
      Quint = _easeMap.Quint,
      Strong = _easeMap.Strong,
      Elastic = _easeMap.Elastic,
      Back = _easeMap.Back,
      SteppedEase = _easeMap.SteppedEase,
      Bounce = _easeMap.Bounce,
      Sine = _easeMap.Sine,
      Expo = _easeMap.Expo,
      Circ = _easeMap.Circ;

  var _win$1,
      _doc$1,
      _docElement,
      _pluginInitted,
      _tempDiv,
      _tempDivStyler,
      _recentSetterPlugin,
      _windowExists$1 = function _windowExists() {
    return typeof window !== "undefined";
  },
      _transformProps = {},
      _RAD2DEG = 180 / Math.PI,
      _DEG2RAD = Math.PI / 180,
      _atan2 = Math.atan2,
      _bigNum$1 = 1e8,
      _capsExp = /([A-Z])/g,
      _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
      _complexExp = /[\s,\(]\S/,
      _propertyAliases = {
    autoAlpha: "opacity,visibility",
    scale: "scaleX,scaleY",
    alpha: "opacity"
  },
      _renderCSSProp = function _renderCSSProp(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
  },
      _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
  },
      _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
  },
      _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
    var value = data.s + data.c * ratio;
    data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
  },
      _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
  },
      _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
  },
      _setterCSSStyle = function _setterCSSStyle(target, property, value) {
    return target.style[property] = value;
  },
      _setterCSSProp = function _setterCSSProp(target, property, value) {
    return target.style.setProperty(property, value);
  },
      _setterTransform = function _setterTransform(target, property, value) {
    return target._gsap[property] = value;
  },
      _setterScale = function _setterScale(target, property, value) {
    return target._gsap.scaleX = target._gsap.scaleY = value;
  },
      _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  },
      _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  },
      _transformProp = "transform",
      _transformOriginProp = _transformProp + "Origin",
      _supports3D,
      _createElement = function _createElement(type, ns) {
    var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type);
    return e.style ? e : _doc$1.createElement(type);
  },
      _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
    var cs = getComputedStyle(target);
    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || "";
  },
      _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
      _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
    var e = element || _tempDiv,
        s = e.style,
        i = 5;

    if (property in s && !preferPrefix) {
      return property;
    }

    property = property.charAt(0).toUpperCase() + property.substr(1);

    while (i-- && !(_prefixes[i] + property in s)) {}

    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
  },
      _initCore = function _initCore() {
    if (_windowExists$1() && window.document) {
      _win$1 = window;
      _doc$1 = _win$1.document;
      _docElement = _doc$1.documentElement;
      _tempDiv = _createElement("div") || {
        style: {}
      };
      _tempDivStyler = _createElement("div");
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + "Origin";
      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
      _supports3D = !!_checkPropPrefix("perspective");
      _pluginInitted = 1;
    }
  },
      _getBBoxHack = function _getBBoxHack(swapIfPossible) {
    var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
        oldParent = this.parentNode,
        oldSibling = this.nextSibling,
        oldCSS = this.style.cssText,
        bbox;

    _docElement.appendChild(svg);

    svg.appendChild(this);
    this.style.display = "block";

    if (swapIfPossible) {
      try {
        bbox = this.getBBox();
        this._gsapBBox = this.getBBox;
        this.getBBox = _getBBoxHack;
      } catch (e) {}
    } else if (this._gsapBBox) {
      bbox = this._gsapBBox();
    }

    if (oldParent) {
      if (oldSibling) {
        oldParent.insertBefore(this, oldSibling);
      } else {
        oldParent.appendChild(this);
      }
    }

    _docElement.removeChild(svg);

    this.style.cssText = oldCSS;
    return bbox;
  },
      _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
    var i = attributesArray.length;

    while (i--) {
      if (target.hasAttribute(attributesArray[i])) {
        return target.getAttribute(attributesArray[i]);
      }
    }
  },
      _getBBox = function _getBBox(target) {
    var bounds;

    try {
      bounds = target.getBBox();
    } catch (error) {
      bounds = _getBBoxHack.call(target, true);
    }

    bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true));
    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
      width: 0,
      height: 0
    } : bounds;
  },
      _isSVG = function _isSVG(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  },
      _removeProperty = function _removeProperty(target, property) {
    if (property) {
      var style = target.style;

      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }

      if (style.removeProperty) {
        if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
          property = "-" + property;
        }

        style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
      } else {
        style.removeAttribute(property);
      }
    }
  },
      _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
    plugin._pt = pt;
    pt.b = beginning;
    pt.e = end;

    plugin._props.push(property);

    return pt;
  },
      _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1
  },
      _convertToUnit = function _convertToUnit(target, property, value, unit) {
    var curValue = parseFloat(value) || 0,
        curUnit = (value + "").trim().substr((curValue + "").length) || "px",
        style = _tempDiv.style,
        horizontal = _horizontalExp.test(property),
        isRootSVG = target.tagName.toLowerCase() === "svg",
        measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
        amount = 100,
        toPixels = unit === "px",
        toPercent = unit === "%",
        px,
        parent,
        cache,
        isSVG;

    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
      return curValue;
    }

    curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
    isSVG = target.getCTM && _isSVG(target);

    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
      return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
    }

    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
    parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }

    if (!parent || parent === _doc$1 || !parent.appendChild) {
      parent = _doc$1.body;
    }

    cache = parent._gsap;

    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
      return _round(curValue / cache.width * amount);
    } else {
      (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";

      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }

    return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
  },
      _get = function _get(target, property, unit, uncache) {
    var value;
    _pluginInitted || _initCore();

    if (property in _propertyAliases && property !== "transform") {
      property = _propertyAliases[property];

      if (~property.indexOf(",")) {
        property = property.split(",")[0];
      }
    }

    if (_transformProps[property] && property !== "transform") {
      value = _parseTransform(target, uncache);
      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
    } else {
      value = target.style[property];

      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
      }
    }

    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
  },
      _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
    if (!start || start === "none") {
      var p = _checkPropPrefix(prop, target, 1),
          s = p && _getComputedProperty(target, p, 1);

      if (s && s !== start) {
        prop = p;
        start = s;
      } else if (prop === "borderColor") {
        start = _getComputedProperty(target, "borderTopColor");
      }
    }

    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
        index = 0,
        matchIndex = 0,
        a,
        result,
        startValues,
        startNum,
        color,
        startValue,
        endValue,
        endNum,
        chunk,
        endUnit,
        startUnit,
        relative,
        endValues;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";

    if (end === "auto") {
      target.style[prop] = end;
      end = _getComputedProperty(target, prop) || end;
      target.style[prop] = start;
    }

    a = [start, end];

    _colorStringFilter(a);

    start = a[0];
    end = a[1];
    startValues = start.match(_numWithUnitExp) || [];
    endValues = end.match(_numWithUnitExp) || [];

    if (endValues.length) {
      while (result = _numWithUnitExp.exec(end)) {
        endValue = result[0];
        chunk = end.substring(index, result.index);

        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
          color = 1;
        }

        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + "").length);
          relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

          if (relative) {
            endValue = endValue.substr(2);
          }

          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + "").length);
          index = _numWithUnitExp.lastIndex - endUnit.length;

          if (!endUnit) {
            endUnit = endUnit || _config.units[prop] || startUnit;

            if (index === end.length) {
              end += endUnit;
              pt.e += endUnit;
            }
          }

          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          }

          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            s: startNum,
            c: relative ? relative * endNum : endNum - startNum,
            m: color && color < 4 || prop === "zIndex" ? Math.round : 0
          };
        }
      }

      pt.c = index < end.length ? end.substring(index, end.length) : "";
    } else {
      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
    }

    _relExp.test(end) && (pt.e = 0);
    this._pt = pt;
    return pt;
  },
      _keywordToPercent = {
    top: "0%",
    bottom: "100%",
    left: "0%",
    right: "100%",
    center: "50%"
  },
      _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
    var split = value.split(" "),
        x = split[0],
        y = split[1] || "50%";

    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
      value = x;
      x = y;
      y = value;
    }

    split[0] = _keywordToPercent[x] || x;
    split[1] = _keywordToPercent[y] || y;
    return split.join(" ");
  },
      _renderClearProps = function _renderClearProps(ratio, data) {
    if (data.tween && data.tween._time === data.tween._dur) {
      var target = data.t,
          style = target.style,
          props = data.u,
          cache = target._gsap,
          prop,
          clearTransforms,
          i;

      if (props === "all" || props === true) {
        style.cssText = "";
        clearTransforms = 1;
      } else {
        props = props.split(",");
        i = props.length;

        while (--i > -1) {
          prop = props[i];

          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
          }

          _removeProperty(target, prop);
        }
      }

      if (clearTransforms) {
        _removeProperty(target, _transformProp);

        if (cache) {
          cache.svg && target.removeAttribute("transform");

          _parseTransform(target, 1);

          cache.uncache = 1;
        }
      }
    }
  },
      _specialProps = {
    clearProps: function clearProps(plugin, target, property, endValue, tween) {
      if (tween.data !== "isFromStart") {
        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;

        plugin._props.push(property);

        return 1;
      }
    }
  },
      _identity2DMatrix = [1, 0, 0, 1, 0, 0],
      _rotationalProperties = {},
      _isNullTransform = function _isNullTransform(value) {
    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
  },
      _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
    var matrixString = _getComputedProperty(target, _transformProp);

    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
  },
      _getMatrix = function _getMatrix(target, force2D) {
    var cache = target._gsap || _getCache(target),
        style = target.style,
        matrix = _getComputedTransformMatrixAsArray(target),
        parent,
        nextSibling,
        temp,
        addedToDOM;

    if (cache.svg && target.getAttribute("transform")) {
      temp = target.transform.baseVal.consolidate().matrix;
      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
      temp = style.display;
      style.display = "block";
      parent = target.parentNode;

      if (!parent || !target.offsetParent) {
        addedToDOM = 1;
        nextSibling = target.nextSibling;

        _docElement.appendChild(target);
      }

      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? style.display = temp : _removeProperty(target, "display");

      if (addedToDOM) {
        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
      }
    }

    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
  },
      _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
    var cache = target._gsap,
        matrix = matrixArray || _getMatrix(target, true),
        xOriginOld = cache.xOrigin || 0,
        yOriginOld = cache.yOrigin || 0,
        xOffsetOld = cache.xOffset || 0,
        yOffsetOld = cache.yOffset || 0,
        a = matrix[0],
        b = matrix[1],
        c = matrix[2],
        d = matrix[3],
        tx = matrix[4],
        ty = matrix[5],
        originSplit = origin.split(" "),
        xOrigin = parseFloat(originSplit[0]) || 0,
        yOrigin = parseFloat(originSplit[1]) || 0,
        bounds,
        determinant,
        x,
        y;

    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
      xOrigin = x;
      yOrigin = y;
    }

    if (smooth || smooth !== false && cache.smooth) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }

    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = "0px 0px";

    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
    }

    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
  },
      _parseTransform = function _parseTransform(target, uncache) {
    var cache = target._gsap || new GSCache(target);

    if ("x" in cache && !uncache && !cache.uncache) {
      return cache;
    }

    var style = target.style,
        invertedScaleX = cache.scaleX < 0,
        px = "px",
        deg = "deg",
        origin = _getComputedProperty(target, _transformOriginProp) || "0",
        x,
        y,
        z,
        scaleX,
        scaleY,
        rotation,
        rotationX,
        rotationY,
        skewX,
        skewY,
        perspective,
        xOrigin,
        yOrigin,
        matrix,
        angle,
        cos,
        sin,
        a,
        b,
        c,
        d,
        a12,
        a22,
        t1,
        t2,
        t3,
        a13,
        a23,
        a33,
        a42,
        a43,
        a32;
    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    matrix = _getMatrix(target, cache.svg);

    if (cache.svg) {
      t1 = (!cache.uncache || origin === "0px 0px") && !uncache && target.getAttribute("data-svg-origin");

      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
    }

    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;

    if (matrix !== _identity2DMatrix) {
      a = matrix[0];
      b = matrix[1];
      c = matrix[2];
      d = matrix[3];
      x = a12 = matrix[4];
      y = a22 = matrix[5];

      if (matrix.length === 6) {
        scaleX = Math.sqrt(a * a + b * b);
        scaleY = Math.sqrt(d * d + c * c);
        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));

        if (cache.svg) {
          x -= xOrigin - (xOrigin * a + yOrigin * c);
          y -= yOrigin - (xOrigin * b + yOrigin * d);
        }
      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x = matrix[12];
        y = matrix[13];
        z = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG;

        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a12 * cos + a13 * sin;
          t2 = a22 * cos + a23 * sin;
          t3 = a32 * cos + a33 * sin;
          a13 = a12 * -sin + a13 * cos;
          a23 = a22 * -sin + a23 * cos;
          a33 = a32 * -sin + a33 * cos;
          a43 = a42 * -sin + a43 * cos;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        }

        angle = _atan2(-c, a33);
        rotationY = angle * _RAD2DEG;

        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a * cos - a13 * sin;
          t2 = b * cos - a23 * sin;
          t3 = c * cos - a33 * sin;
          a43 = d * sin + a43 * cos;
          a = t1;
          b = t2;
          c = t3;
        }

        angle = _atan2(b, a);
        rotation = angle * _RAD2DEG;

        if (angle) {
          cos = Math.cos(angle);
          sin = Math.sin(angle);
          t1 = a * cos + b * sin;
          t2 = a12 * cos + a22 * sin;
          b = b * cos - a * sin;
          a22 = a22 * cos - a12 * sin;
          a = t1;
          a12 = t2;
        }

        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }

        scaleX = _round(Math.sqrt(a * a + b * b + c * c));
        scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }

      if (cache.svg) {
        t1 = target.getAttribute("transform");
        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute("transform", t1);
      }
    }

    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }

    cache.x = x - ((cache.xPercent = x && (cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
    cache.y = y - ((cache.yPercent = y && (cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
    cache.z = z + px;
    cache.scaleX = _round(scaleX);
    cache.scaleY = _round(scaleY);
    cache.rotation = _round(rotation) + deg;
    cache.rotationX = _round(rotationX) + deg;
    cache.rotationY = _round(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;

    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
      style[_transformOriginProp] = _firstTwoOnly(origin);
    }

    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  },
      _firstTwoOnly = function _firstTwoOnly(value) {
    return (value = value.split(" "))[0] + " " + value[1];
  },
      _addPxTranslate = function _addPxTranslate(target, start, value) {
    var unit = getUnit(start);
    return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
  },
      _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
    cache.z = "0px";
    cache.rotationY = cache.rotationX = "0deg";
    cache.force3D = 0;

    _renderCSSTransforms(ratio, cache);
  },
      _zeroDeg = "0deg",
      _zeroPx = "0px",
      _endParenthesis = ") ",
      _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
    var _ref = cache || this,
        xPercent = _ref.xPercent,
        yPercent = _ref.yPercent,
        x = _ref.x,
        y = _ref.y,
        z = _ref.z,
        rotation = _ref.rotation,
        rotationY = _ref.rotationY,
        rotationX = _ref.rotationX,
        skewX = _ref.skewX,
        skewY = _ref.skewY,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        transformPerspective = _ref.transformPerspective,
        force3D = _ref.force3D,
        target = _ref.target,
        zOrigin = _ref.zOrigin,
        transforms = "",
        use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;

    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD,
          a13 = Math.sin(angle),
          a33 = Math.cos(angle),
          cos;

      angle = parseFloat(rotationX) * _DEG2RAD;
      cos = Math.cos(angle);
      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
    }

    if (transformPerspective !== _zeroPx) {
      transforms += "perspective(" + transformPerspective + _endParenthesis;
    }

    if (xPercent || yPercent) {
      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
    }

    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
    }

    if (rotation !== _zeroDeg) {
      transforms += "rotate(" + rotation + _endParenthesis;
    }

    if (rotationY !== _zeroDeg) {
      transforms += "rotateY(" + rotationY + _endParenthesis;
    }

    if (rotationX !== _zeroDeg) {
      transforms += "rotateX(" + rotationX + _endParenthesis;
    }

    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
    }

    if (scaleX !== 1 || scaleY !== 1) {
      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
    }

    target.style[_transformProp] = transforms || "translate(0, 0)";
  },
      _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
    var _ref2 = cache || this,
        xPercent = _ref2.xPercent,
        yPercent = _ref2.yPercent,
        x = _ref2.x,
        y = _ref2.y,
        rotation = _ref2.rotation,
        skewX = _ref2.skewX,
        skewY = _ref2.skewY,
        scaleX = _ref2.scaleX,
        scaleY = _ref2.scaleY,
        target = _ref2.target,
        xOrigin = _ref2.xOrigin,
        yOrigin = _ref2.yOrigin,
        xOffset = _ref2.xOffset,
        yOffset = _ref2.yOffset,
        forceCSS = _ref2.forceCSS,
        tx = parseFloat(x),
        ty = parseFloat(y),
        a11,
        a21,
        a12,
        a22,
        temp;

    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);

    if (skewY) {
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }

    if (rotation || skewX) {
      rotation *= _DEG2RAD;
      skewX *= _DEG2RAD;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;

      if (skewX) {
        skewY *= _DEG2RAD;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;

        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }

      a11 = _round(a11);
      a21 = _round(a21);
      a12 = _round(a12);
      a22 = _round(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }

    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
      tx = _convertToUnit(target, "x", x, "px");
      ty = _convertToUnit(target, "y", y, "px");
    }

    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }

    if (xPercent || yPercent) {
      temp = target.getBBox();
      tx = _round(tx + xPercent / 100 * temp.width);
      ty = _round(ty + yPercent / 100 * temp.height);
    }

    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
    target.setAttribute("transform", temp);
    forceCSS && (target.style[_transformProp] = temp);
  },
      _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
    var cap = 360,
        isString = _isString(endValue),
        endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
        change = relative ? endNum * relative : endNum - startNum,
        finalValue = startNum + change + "deg",
        direction,
        pt;

    if (isString) {
      direction = endValue.split("_")[1];

      if (direction === "short") {
        change %= cap;

        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }

      if (direction === "cw" && change < 0) {
        change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      } else if (direction === "ccw" && change > 0) {
        change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      }
    }

    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
    pt.e = finalValue;
    pt.u = "deg";

    plugin._props.push(property);

    return pt;
  },
      _assign = function _assign(target, source) {
    for (var p in source) {
      target[p] = source[p];
    }

    return target;
  },
      _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
    var startCache = _assign({}, target._gsap),
        exclude = "perspective,force3D,transformOrigin,svgOrigin",
        style = target.style,
        endCache,
        p,
        startValue,
        endValue,
        startNum,
        endNum,
        startUnit,
        endUnit;

    if (startCache.svg) {
      startValue = target.getAttribute("transform");
      target.setAttribute("transform", "");
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);

      _removeProperty(target, _transformProp);

      target.setAttribute("transform", startValue);
    } else {
      startValue = getComputedStyle(target)[_transformProp];
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      style[_transformProp] = startValue;
    }

    for (p in _transformProps) {
      startValue = startCache[p];
      endValue = endCache[p];

      if (startValue !== endValue && exclude.indexOf(p) < 0) {
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
        plugin._pt.u = endUnit || 0;

        plugin._props.push(p);
      }
    }

    _assign(endCache, startCache);
  };

  _forEachName("padding,margin,Width,Radius", function (name, index) {
    var t = "Top",
        r = "Right",
        b = "Bottom",
        l = "Left",
        props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
      return index < 2 ? name + side : "border" + side + name;
    });

    _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
      var a, vars;

      if (arguments.length < 4) {
        a = props.map(function (prop) {
          return _get(plugin, prop, property);
        });
        vars = a.join(" ");
        return vars.split(a[0]).length === 5 ? a[0] : vars;
      }

      a = (endValue + "").split(" ");
      vars = {};
      props.forEach(function (prop, i) {
        return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
      });
      plugin.init(target, vars, tween);
    };
  });

  var CSSPlugin = {
    name: "css",
    register: _initCore,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init(target, vars, tween, index, targets) {
      var props = this._props,
          style = target.style,
          startAt = tween.vars.startAt,
          startValue,
          endValue,
          endNum,
          startNum,
          type,
          specialProp,
          p,
          startUnit,
          endUnit,
          relative,
          isTransformRelated,
          transformPropTween,
          cache,
          smooth,
          hasPriority;
      _pluginInitted || _initCore();

      for (p in vars) {
        if (p === "autoRound") {
          continue;
        }

        endValue = vars[p];

        if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
          continue;
        }

        type = typeof endValue;
        specialProp = _specialProps[p];

        if (type === "function") {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }

        if (type === "string" && ~endValue.indexOf("random(")) {
          endValue = _replaceRandom(endValue);
        }

        if (specialProp) {
          specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
        } else if (p.substr(0, 2) === "--") {
          startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
          endValue += "";
          _colorExp.lastIndex = 0;

          if (!_colorExp.test(startValue)) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
          }

          endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
          this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
          props.push(p);
        } else if (type !== "undefined") {
          if (startAt && p in startAt) {
            startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
            _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
            getUnit(startValue + "") || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
            (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
          } else {
            startValue = _get(target, p);
          }

          startNum = parseFloat(startValue);
          relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
          relative && (endValue = endValue.substr(2));
          endNum = parseFloat(endValue);

          if (p in _propertyAliases) {
            if (p === "autoAlpha") {
              if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                startNum = 0;
              }

              _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
            }

            if (p !== "scale" && p !== "transform") {
              p = _propertyAliases[p];
              ~p.indexOf(",") && (p = p.split(",")[0]);
            }
          }

          isTransformRelated = p in _transformProps;

          if (isTransformRelated) {
            if (!transformPropTween) {
              cache = target._gsap;
              cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
              transformPropTween.dep = 1;
            }

            if (p === "scale") {
              this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? relative * endNum : endNum - cache.scaleY) || 0);
              props.push("scaleY", p);
              p += "X";
            } else if (p === "transformOrigin") {
              endValue = _convertKeywordsToPercentages(endValue);

              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

                _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
              }

              continue;
            } else if (p === "svgOrigin") {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);

              continue;
            } else if (p in _rotationalProperties) {
              _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

              continue;
            } else if (p === "smoothOrigin") {
              _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

              continue;
            } else if (p === "force3D") {
              cache[p] = endValue;
              continue;
            } else if (p === "transform") {
              _addRawTransformPTs(this, endValue, target);

              continue;
            }
          } else if (!(p in style)) {
            p = _checkPropPrefix(p) || p;
          }

          if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
            startUnit = (startValue + "").substr((startNum + "").length);
            endNum || (endNum = 0);
            endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
            startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
            this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
            this._pt.u = endUnit || 0;

            if (startUnit !== endUnit && endUnit !== "%") {
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p in style)) {
            if (p in target) {
              this.add(target, p, startValue || target[p], endValue, index, targets);
            } else {
              _missingPlugin(p, endValue);

              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p, startValue, endValue);
          }

          props.push(p);
        }
      }

      hasPriority && _sortPropTweensByPriority(this);
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin) {
      var p = _propertyAliases[property];
      p && p.indexOf(",") < 0 && (property = p);
      return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
    },
    core: {
      _removeProperty: _removeProperty,
      _getMatrix: _getMatrix
    }
  };
  gsap.utils.checkPrefix = _checkPropPrefix;

  (function (positionAndScale, rotation, others, aliases) {
    var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
      _transformProps[name] = 1;
    });

    _forEachName(rotation, function (name) {
      _config.units[name] = "deg";
      _rotationalProperties[name] = 1;
    });

    _propertyAliases[all[13]] = positionAndScale + "," + rotation;

    _forEachName(aliases, function (name) {
      var split = name.split(":");
      _propertyAliases[split[1]] = all[split[0]];
    });
  })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

  _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
    _config.units[name] = "px";
  });

  gsap.registerPlugin(CSSPlugin);

  var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap,
      TweenMaxWithCSS = gsapWithCSS.core.Tween;

  exports.Back = Back;
  exports.Bounce = Bounce;
  exports.CSSPlugin = CSSPlugin;
  exports.Circ = Circ;
  exports.Cubic = Cubic;
  exports.Elastic = Elastic;
  exports.Expo = Expo;
  exports.Linear = Linear;
  exports.Power0 = Power0;
  exports.Power1 = Power1;
  exports.Power2 = Power2;
  exports.Power3 = Power3;
  exports.Power4 = Power4;
  exports.Quad = Quad;
  exports.Quart = Quart;
  exports.Quint = Quint;
  exports.Sine = Sine;
  exports.SteppedEase = SteppedEase;
  exports.Strong = Strong;
  exports.TimelineLite = Timeline;
  exports.TimelineMax = Timeline;
  exports.TweenLite = Tween;
  exports.TweenMax = TweenMaxWithCSS;
  exports.default = gsapWithCSS;
  exports.gsap = gsapWithCSS;

  if (typeof(window) === 'undefined' || window !== exports) {Object.defineProperty(exports, '__esModule', { value: true });} else {delete window.default;}

})));

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function initLazyload() {
  var imgObserver = new IntersectionObserver(function (entries, self) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        lazyLoad(entry.target);
        self.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll('.lazy-picture').forEach(function (picture) {
    imgObserver.observe(picture);
  });

  var lazyLoad = function lazyLoad(picture) {
    var img = picture.querySelector('img') || picture;
    var sources = picture.querySelectorAll('source');
    sources.forEach(function (source) {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    });

    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  };
}

var _default = initLazyload;
exports["default"] = _default;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _gsap = require("gsap");

var _ScrollTrigger = require("gsap/dist/ScrollTrigger");

_gsap.gsap.registerPlugin(_ScrollTrigger.ScrollTrigger);

function initParallaxAnimations() {
  var els = document.querySelectorAll('[data-parallax="true"]'),
      multiplier = 20,
      breakpointDesktop = 1440;
  els.forEach(function (el, index) {
    var elTl = _gsap.gsap.timeline(); // const width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;


    elTl.to(el, {
      yPercent: index * (Math.random() - 0.5) * multiplier
    });

    _ScrollTrigger.ScrollTrigger.create({
      animation: elTl,
      trigger: el,
      start: 'top bottom',
      scrub: true
    });
  });
}

var _default = initParallaxAnimations;
exports["default"] = _default;

},{"gsap":2,"gsap/dist/ScrollTrigger":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function scrollToSection() {
  var btn = document.querySelector('.js-scroll-to');

  if (btn) {
    btn.addEventListener('click', function () {
      var target = document.querySelector(btn.getAttribute('data-href'));

      if (target) {
        var offset = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: offset,
          behaviour: 'smooth'
        });
      }
    });
  }
}

var _default = scrollToSection;
exports["default"] = _default;

},{}],6:[function(require,module,exports){
"use strict";

var _lazyload = _interopRequireDefault(require("./components/lazyload"));

var _scrollToSection = _interopRequireDefault(require("./components/scrollToSection"));

var _parallaxAnimations = _interopRequireDefault(require("./components/parallaxAnimations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import initSplitting from './components/splitting';
window.addEventListener('load', function () {// console.warn('loaded');
});
document.addEventListener('DOMContentLoaded', function () {
  (0, _lazyload["default"])();
  (0, _scrollToSection["default"])();
  (0, _parallaxAnimations["default"])(); // initSplitting();
});

},{"./components/lazyload":3,"./components/parallaxAnimations":4,"./components/scrollToSection":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZ3NhcC9kaXN0L1Njcm9sbFRyaWdnZXIuanMiLCJub2RlX21vZHVsZXMvZ3NhcC9kaXN0L2dzYXAuanMiLCJzcmMvanMvY29tcG9uZW50cy9sYXp5bG9hZC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3BhcmFsbGF4QW5pbWF0aW9ucy5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Njcm9sbFRvU2VjdGlvbi5qcyIsInNyYy9qcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcDBEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNoNUpBLFNBQVMsWUFBVCxHQUF3QjtBQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFKLENBQXlCLFVBQUMsT0FBRCxFQUFVLElBQVYsRUFBbUI7QUFDOUQsSUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFBLEtBQUssRUFBSTtBQUN2QixVQUFJLEtBQUssQ0FBQyxjQUFWLEVBQTBCO0FBQ3hCLFFBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFQLENBQVI7QUFDQSxRQUFBLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBSyxDQUFDLE1BQXJCO0FBQ0Q7QUFDRixLQUxEO0FBTUQsR0FQbUIsQ0FBcEI7QUFRQSxFQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxPQUEzQyxDQUFtRCxVQUFDLE9BQUQsRUFBYTtBQUM5RCxJQUFBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLE9BQXBCO0FBQ0QsR0FGRDs7QUFJQSxNQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVcsQ0FBQyxPQUFELEVBQWE7QUFDNUIsUUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsS0FBdEIsS0FBZ0MsT0FBNUM7QUFDQSxRQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsUUFBekIsQ0FBaEI7QUFFQSxJQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQUMsTUFBRCxFQUFZO0FBQzFCLE1BQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUEvQjtBQUNBLE1BQUEsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsYUFBdkI7QUFDRCxLQUhEOztBQUlBLFFBQUksR0FBSixFQUFTO0FBQ1AsTUFBQSxHQUFHLENBQUMsR0FBSixHQUFVLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxlQUFKLENBQW9CLFVBQXBCO0FBQ0Q7QUFDRixHQVpEO0FBYUQ7O2VBRWMsWTs7Ozs7Ozs7Ozs7QUM1QmY7O0FBQ0E7O0FBRUEsV0FBSyxjQUFMLENBQW9CLDRCQUFwQjs7QUFFQSxTQUFTLHNCQUFULEdBQWtDO0FBQzlCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQix3QkFBMUIsQ0FBWjtBQUFBLE1BQ0ksVUFBVSxHQUFHLEVBRGpCO0FBQUEsTUFFSSxpQkFBaUIsR0FBRyxJQUZ4QjtBQUlBLEVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUFDLEVBQUQsRUFBSyxLQUFMLEVBQWU7QUFDdkIsUUFBTSxJQUFJLEdBQUcsV0FBSyxRQUFMLEVBQWIsQ0FEdUIsQ0FHdkI7OztBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxFQUFSLEVBQVk7QUFDUixNQUFBLFFBQVEsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQUwsS0FBZ0IsR0FBcEIsQ0FBTCxHQUFnQztBQURsQyxLQUFaOztBQUlBLGlDQUFjLE1BQWQsQ0FBcUI7QUFDakIsTUFBQSxTQUFTLEVBQUUsSUFETTtBQUVqQixNQUFBLE9BQU8sRUFBRSxFQUZRO0FBR2pCLE1BQUEsS0FBSyxFQUFFLFlBSFU7QUFJakIsTUFBQSxLQUFLLEVBQUU7QUFKVSxLQUFyQjtBQU1ILEdBZEQ7QUFlSDs7ZUFFYyxzQjs7Ozs7Ozs7Ozs7QUMzQmYsU0FBUyxlQUFULEdBQTJCO0FBQ3pCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGVBQXZCLENBQVo7O0FBRUEsTUFBSSxHQUFKLEVBQVM7QUFDUCxJQUFBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixPQUFyQixFQUE4QixZQUFNO0FBQ2xDLFVBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFdBQWpCLENBQXZCLENBQWY7O0FBRUEsVUFBSSxNQUFKLEVBQVk7QUFDVixZQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMscUJBQVAsR0FBK0IsR0FBL0IsR0FBcUMsTUFBTSxDQUFDLE9BQTNEO0FBRUEsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQjtBQUNkLFVBQUEsR0FBRyxFQUFFLE1BRFM7QUFFZCxVQUFBLFNBQVMsRUFBRTtBQUZHLFNBQWhCO0FBSUQ7QUFDRixLQVhEO0FBWUQ7QUFDRjs7ZUFFYyxlOzs7Ozs7QUNuQmY7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTtBQUVBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFNLENBQ2xDO0FBQ0gsQ0FGRDtBQUlBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBTTtBQUNoRDtBQUNBO0FBQ0Esd0NBSGdELENBSWhEO0FBQ0gsQ0FMRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcblx0KGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC53aW5kb3cgPSBnbG9iYWwud2luZG93IHx8IHt9KSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cblx0LyohXG5cdCAqIFNjcm9sbFRyaWdnZXIgMy45LjFcblx0ICogaHR0cHM6Ly9ncmVlbnNvY2suY29tXG5cdCAqXG5cdCAqIEBsaWNlbnNlIENvcHlyaWdodCAyMDA4LTIwMjEsIEdyZWVuU29jay4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblx0ICogU3ViamVjdCB0byB0aGUgdGVybXMgYXQgaHR0cHM6Ly9ncmVlbnNvY2suY29tL3N0YW5kYXJkLWxpY2Vuc2Ugb3IgZm9yXG5cdCAqIENsdWIgR3JlZW5Tb2NrIG1lbWJlcnMsIHRoZSBhZ3JlZW1lbnQgaXNzdWVkIHdpdGggdGhhdCBtZW1iZXJzaGlwLlxuXHQgKiBAYXV0aG9yOiBKYWNrIERveWxlLCBqYWNrQGdyZWVuc29jay5jb21cblx0Ki9cblx0dmFyIGdzYXAsXG5cdCAgICBfY29yZUluaXR0ZWQsXG5cdCAgICBfd2luLFxuXHQgICAgX2RvYyxcblx0ICAgIF9kb2NFbCxcblx0ICAgIF9ib2R5LFxuXHQgICAgX3Jvb3QsXG5cdCAgICBfcmVzaXplRGVsYXksXG5cdCAgICBfdG9BcnJheSxcblx0ICAgIF9jbGFtcCxcblx0ICAgIF90aW1lMixcblx0ICAgIF9zeW5jSW50ZXJ2YWwsXG5cdCAgICBfcmVmcmVzaGluZyxcblx0ICAgIF9wb2ludGVySXNEb3duLFxuXHQgICAgX3RyYW5zZm9ybVByb3AsXG5cdCAgICBfaSxcblx0ICAgIF9wcmV2V2lkdGgsXG5cdCAgICBfcHJldkhlaWdodCxcblx0ICAgIF9hdXRvUmVmcmVzaCxcblx0ICAgIF9zb3J0LFxuXHQgICAgX3N1cHByZXNzT3ZlcndyaXRlcyxcblx0ICAgIF9pZ25vcmVSZXNpemUsXG5cdCAgICBfbGltaXRDYWxsYmFja3MsXG5cdCAgICBfc3RhcnR1cCA9IDEsXG5cdCAgICBfcHJveGllcyA9IFtdLFxuXHQgICAgX3Njcm9sbGVycyA9IFtdLFxuXHQgICAgX2dldFRpbWUgPSBEYXRlLm5vdyxcblx0ICAgIF90aW1lMSA9IF9nZXRUaW1lKCksXG5cdCAgICBfbGFzdFNjcm9sbFRpbWUgPSAwLFxuXHQgICAgX2VuYWJsZWQgPSAxLFxuXHQgICAgX3Bhc3NUaHJvdWdoID0gZnVuY3Rpb24gX3Bhc3NUaHJvdWdoKHYpIHtcblx0ICByZXR1cm4gdjtcblx0fSxcblx0ICAgIF9nZXRUYXJnZXQgPSBmdW5jdGlvbiBfZ2V0VGFyZ2V0KHQpIHtcblx0ICByZXR1cm4gX3RvQXJyYXkodClbMF0gfHwgKF9pc1N0cmluZyh0KSAmJiBnc2FwLmNvbmZpZygpLm51bGxUYXJnZXRXYXJuICE9PSBmYWxzZSA/IGNvbnNvbGUud2FybihcIkVsZW1lbnQgbm90IGZvdW5kOlwiLCB0KSA6IG51bGwpO1xuXHR9LFxuXHQgICAgX3JvdW5kID0gZnVuY3Rpb24gX3JvdW5kKHZhbHVlKSB7XG5cdCAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAxMDAwMDApIC8gMTAwMDAwIHx8IDA7XG5cdH0sXG5cdCAgICBfd2luZG93RXhpc3RzID0gZnVuY3Rpb24gX3dpbmRvd0V4aXN0cygpIHtcblx0ICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIjtcblx0fSxcblx0ICAgIF9nZXRHU0FQID0gZnVuY3Rpb24gX2dldEdTQVAoKSB7XG5cdCAgcmV0dXJuIGdzYXAgfHwgX3dpbmRvd0V4aXN0cygpICYmIChnc2FwID0gd2luZG93LmdzYXApICYmIGdzYXAucmVnaXN0ZXJQbHVnaW4gJiYgZ3NhcDtcblx0fSxcblx0ICAgIF9pc1ZpZXdwb3J0ID0gZnVuY3Rpb24gX2lzVmlld3BvcnQoZSkge1xuXHQgIHJldHVybiAhIX5fcm9vdC5pbmRleE9mKGUpO1xuXHR9LFxuXHQgICAgX2dldFByb3h5UHJvcCA9IGZ1bmN0aW9uIF9nZXRQcm94eVByb3AoZWxlbWVudCwgcHJvcGVydHkpIHtcblx0ICByZXR1cm4gfl9wcm94aWVzLmluZGV4T2YoZWxlbWVudCkgJiYgX3Byb3hpZXNbX3Byb3hpZXMuaW5kZXhPZihlbGVtZW50KSArIDFdW3Byb3BlcnR5XTtcblx0fSxcblx0ICAgIF9nZXRTY3JvbGxGdW5jID0gZnVuY3Rpb24gX2dldFNjcm9sbEZ1bmMoZWxlbWVudCwgX3JlZikge1xuXHQgIHZhciBzID0gX3JlZi5zLFxuXHQgICAgICBzYyA9IF9yZWYuc2M7XG5cblx0ICB2YXIgaSA9IF9zY3JvbGxlcnMuaW5kZXhPZihlbGVtZW50KSxcblx0ICAgICAgb2Zmc2V0ID0gc2MgPT09IF92ZXJ0aWNhbC5zYyA/IDEgOiAyO1xuXG5cdCAgIX5pICYmIChpID0gX3Njcm9sbGVycy5wdXNoKGVsZW1lbnQpIC0gMSk7XG5cdCAgcmV0dXJuIF9zY3JvbGxlcnNbaSArIG9mZnNldF0gfHwgKF9zY3JvbGxlcnNbaSArIG9mZnNldF0gPSBfZ2V0UHJveHlQcm9wKGVsZW1lbnQsIHMpIHx8IChfaXNWaWV3cG9ydChlbGVtZW50KSA/IHNjIDogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IGVsZW1lbnRbc10gPSB2YWx1ZSA6IGVsZW1lbnRbc107XG5cdCAgfSkpO1xuXHR9LFxuXHQgICAgX2dldEJvdW5kc0Z1bmMgPSBmdW5jdGlvbiBfZ2V0Qm91bmRzRnVuYyhlbGVtZW50KSB7XG5cdCAgcmV0dXJuIF9nZXRQcm94eVByb3AoZWxlbWVudCwgXCJnZXRCb3VuZGluZ0NsaWVudFJlY3RcIikgfHwgKF9pc1ZpZXdwb3J0KGVsZW1lbnQpID8gZnVuY3Rpb24gKCkge1xuXHQgICAgX3dpbk9mZnNldHMud2lkdGggPSBfd2luLmlubmVyV2lkdGg7XG5cdCAgICBfd2luT2Zmc2V0cy5oZWlnaHQgPSBfd2luLmlubmVySGVpZ2h0O1xuXHQgICAgcmV0dXJuIF93aW5PZmZzZXRzO1xuXHQgIH0gOiBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gX2dldEJvdW5kcyhlbGVtZW50KTtcblx0ICB9KTtcblx0fSxcblx0ICAgIF9nZXRTaXplRnVuYyA9IGZ1bmN0aW9uIF9nZXRTaXplRnVuYyhzY3JvbGxlciwgaXNWaWV3cG9ydCwgX3JlZjIpIHtcblx0ICB2YXIgZCA9IF9yZWYyLmQsXG5cdCAgICAgIGQyID0gX3JlZjIuZDIsXG5cdCAgICAgIGEgPSBfcmVmMi5hO1xuXHQgIHJldHVybiAoYSA9IF9nZXRQcm94eVByb3Aoc2Nyb2xsZXIsIFwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0XCIpKSA/IGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiBhKClbZF07XG5cdCAgfSA6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiAoaXNWaWV3cG9ydCA/IF93aW5bXCJpbm5lclwiICsgZDJdIDogc2Nyb2xsZXJbXCJjbGllbnRcIiArIGQyXSkgfHwgMDtcblx0ICB9O1xuXHR9LFxuXHQgICAgX2dldE9mZnNldHNGdW5jID0gZnVuY3Rpb24gX2dldE9mZnNldHNGdW5jKGVsZW1lbnQsIGlzVmlld3BvcnQpIHtcblx0ICByZXR1cm4gIWlzVmlld3BvcnQgfHwgfl9wcm94aWVzLmluZGV4T2YoZWxlbWVudCkgPyBfZ2V0Qm91bmRzRnVuYyhlbGVtZW50KSA6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiBfd2luT2Zmc2V0cztcblx0ICB9O1xuXHR9LFxuXHQgICAgX21heFNjcm9sbCA9IGZ1bmN0aW9uIF9tYXhTY3JvbGwoZWxlbWVudCwgX3JlZjMpIHtcblx0ICB2YXIgcyA9IF9yZWYzLnMsXG5cdCAgICAgIGQyID0gX3JlZjMuZDIsXG5cdCAgICAgIGQgPSBfcmVmMy5kLFxuXHQgICAgICBhID0gX3JlZjMuYTtcblx0ICByZXR1cm4gKHMgPSBcInNjcm9sbFwiICsgZDIpICYmIChhID0gX2dldFByb3h5UHJvcChlbGVtZW50LCBzKSkgPyBhKCkgLSBfZ2V0Qm91bmRzRnVuYyhlbGVtZW50KSgpW2RdIDogX2lzVmlld3BvcnQoZWxlbWVudCkgPyAoX2JvZHlbc10gfHwgX2RvY0VsW3NdKSAtIChfd2luW1wiaW5uZXJcIiArIGQyXSB8fCBfZG9jRWxbXCJjbGllbnRcIiArIGQyXSB8fCBfYm9keVtcImNsaWVudFwiICsgZDJdKSA6IGVsZW1lbnRbc10gLSBlbGVtZW50W1wib2Zmc2V0XCIgKyBkMl07XG5cdH0sXG5cdCAgICBfaXRlcmF0ZUF1dG9SZWZyZXNoID0gZnVuY3Rpb24gX2l0ZXJhdGVBdXRvUmVmcmVzaChmdW5jLCBldmVudHMpIHtcblx0ICBmb3IgKHZhciBpID0gMDsgaSA8IF9hdXRvUmVmcmVzaC5sZW5ndGg7IGkgKz0gMykge1xuXHQgICAgKCFldmVudHMgfHwgfmV2ZW50cy5pbmRleE9mKF9hdXRvUmVmcmVzaFtpICsgMV0pKSAmJiBmdW5jKF9hdXRvUmVmcmVzaFtpXSwgX2F1dG9SZWZyZXNoW2kgKyAxXSwgX2F1dG9SZWZyZXNoW2kgKyAyXSk7XG5cdCAgfVxuXHR9LFxuXHQgICAgX2lzU3RyaW5nID0gZnVuY3Rpb24gX2lzU3RyaW5nKHZhbHVlKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIjtcblx0fSxcblx0ICAgIF9pc0Z1bmN0aW9uID0gZnVuY3Rpb24gX2lzRnVuY3Rpb24odmFsdWUpIHtcblx0ICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCI7XG5cdH0sXG5cdCAgICBfaXNOdW1iZXIgPSBmdW5jdGlvbiBfaXNOdW1iZXIodmFsdWUpIHtcblx0ICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiO1xuXHR9LFxuXHQgICAgX2lzT2JqZWN0ID0gZnVuY3Rpb24gX2lzT2JqZWN0KHZhbHVlKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIjtcblx0fSxcblx0ICAgIF9jYWxsSWZGdW5jID0gZnVuY3Rpb24gX2NhbGxJZkZ1bmModmFsdWUpIHtcblx0ICByZXR1cm4gX2lzRnVuY3Rpb24odmFsdWUpICYmIHZhbHVlKCk7XG5cdH0sXG5cdCAgICBfY29tYmluZUZ1bmMgPSBmdW5jdGlvbiBfY29tYmluZUZ1bmMoZjEsIGYyKSB7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciByZXN1bHQxID0gX2NhbGxJZkZ1bmMoZjEpLFxuXHQgICAgICAgIHJlc3VsdDIgPSBfY2FsbElmRnVuYyhmMik7XG5cblx0ICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIF9jYWxsSWZGdW5jKHJlc3VsdDEpO1xuXG5cdCAgICAgIF9jYWxsSWZGdW5jKHJlc3VsdDIpO1xuXHQgICAgfTtcblx0ICB9O1xuXHR9LFxuXHQgICAgX2VuZEFuaW1hdGlvbiA9IGZ1bmN0aW9uIF9lbmRBbmltYXRpb24oYW5pbWF0aW9uLCByZXZlcnNlZCwgcGF1c2UpIHtcblx0ICByZXR1cm4gYW5pbWF0aW9uICYmIGFuaW1hdGlvbi5wcm9ncmVzcyhyZXZlcnNlZCA/IDAgOiAxKSAmJiBwYXVzZSAmJiBhbmltYXRpb24ucGF1c2UoKTtcblx0fSxcblx0ICAgIF9jYWxsYmFjayA9IGZ1bmN0aW9uIF9jYWxsYmFjayhzZWxmLCBmdW5jKSB7XG5cdCAgaWYgKHNlbGYuZW5hYmxlZCkge1xuXHQgICAgdmFyIHJlc3VsdCA9IGZ1bmMoc2VsZik7XG5cdCAgICByZXN1bHQgJiYgcmVzdWx0LnRvdGFsVGltZSAmJiAoc2VsZi5jYWxsYmFja0FuaW1hdGlvbiA9IHJlc3VsdCk7XG5cdCAgfVxuXHR9LFxuXHQgICAgX2FicyA9IE1hdGguYWJzLFxuXHQgICAgX3Njcm9sbExlZnQgPSBcInNjcm9sbExlZnRcIixcblx0ICAgIF9zY3JvbGxUb3AgPSBcInNjcm9sbFRvcFwiLFxuXHQgICAgX2xlZnQgPSBcImxlZnRcIixcblx0ICAgIF90b3AgPSBcInRvcFwiLFxuXHQgICAgX3JpZ2h0ID0gXCJyaWdodFwiLFxuXHQgICAgX2JvdHRvbSA9IFwiYm90dG9tXCIsXG5cdCAgICBfd2lkdGggPSBcIndpZHRoXCIsXG5cdCAgICBfaGVpZ2h0ID0gXCJoZWlnaHRcIixcblx0ICAgIF9SaWdodCA9IFwiUmlnaHRcIixcblx0ICAgIF9MZWZ0ID0gXCJMZWZ0XCIsXG5cdCAgICBfVG9wID0gXCJUb3BcIixcblx0ICAgIF9Cb3R0b20gPSBcIkJvdHRvbVwiLFxuXHQgICAgX3BhZGRpbmcgPSBcInBhZGRpbmdcIixcblx0ICAgIF9tYXJnaW4gPSBcIm1hcmdpblwiLFxuXHQgICAgX1dpZHRoID0gXCJXaWR0aFwiLFxuXHQgICAgX0hlaWdodCA9IFwiSGVpZ2h0XCIsXG5cdCAgICBfcHggPSBcInB4XCIsXG5cdCAgICBfaG9yaXpvbnRhbCA9IHtcblx0ICBzOiBfc2Nyb2xsTGVmdCxcblx0ICBwOiBfbGVmdCxcblx0ICBwMjogX0xlZnQsXG5cdCAgb3M6IF9yaWdodCxcblx0ICBvczI6IF9SaWdodCxcblx0ICBkOiBfd2lkdGgsXG5cdCAgZDI6IF9XaWR0aCxcblx0ICBhOiBcInhcIixcblx0ICBzYzogZnVuY3Rpb24gc2ModmFsdWUpIHtcblx0ICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gX3dpbi5zY3JvbGxUbyh2YWx1ZSwgX3ZlcnRpY2FsLnNjKCkpIDogX3dpbi5wYWdlWE9mZnNldCB8fCBfZG9jW19zY3JvbGxMZWZ0XSB8fCBfZG9jRWxbX3Njcm9sbExlZnRdIHx8IF9ib2R5W19zY3JvbGxMZWZ0XSB8fCAwO1xuXHQgIH1cblx0fSxcblx0ICAgIF92ZXJ0aWNhbCA9IHtcblx0ICBzOiBfc2Nyb2xsVG9wLFxuXHQgIHA6IF90b3AsXG5cdCAgcDI6IF9Ub3AsXG5cdCAgb3M6IF9ib3R0b20sXG5cdCAgb3MyOiBfQm90dG9tLFxuXHQgIGQ6IF9oZWlnaHQsXG5cdCAgZDI6IF9IZWlnaHQsXG5cdCAgYTogXCJ5XCIsXG5cdCAgb3A6IF9ob3Jpem9udGFsLFxuXHQgIHNjOiBmdW5jdGlvbiBzYyh2YWx1ZSkge1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBfd2luLnNjcm9sbFRvKF9ob3Jpem9udGFsLnNjKCksIHZhbHVlKSA6IF93aW4ucGFnZVlPZmZzZXQgfHwgX2RvY1tfc2Nyb2xsVG9wXSB8fCBfZG9jRWxbX3Njcm9sbFRvcF0gfHwgX2JvZHlbX3Njcm9sbFRvcF0gfHwgMDtcblx0ICB9XG5cdH0sXG5cdCAgICBfZ2V0Q29tcHV0ZWRTdHlsZSA9IGZ1bmN0aW9uIF9nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpIHtcblx0ICByZXR1cm4gX3dpbi5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuXHR9LFxuXHQgICAgX21ha2VQb3NpdGlvbmFibGUgPSBmdW5jdGlvbiBfbWFrZVBvc2l0aW9uYWJsZShlbGVtZW50KSB7XG5cdCAgdmFyIHBvc2l0aW9uID0gX2dldENvbXB1dGVkU3R5bGUoZWxlbWVudCkucG9zaXRpb247XG5cblx0ICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gcG9zaXRpb24gPT09IFwiYWJzb2x1dGVcIiB8fCBwb3NpdGlvbiA9PT0gXCJmaXhlZFwiID8gcG9zaXRpb24gOiBcInJlbGF0aXZlXCI7XG5cdH0sXG5cdCAgICBfc2V0RGVmYXVsdHMgPSBmdW5jdGlvbiBfc2V0RGVmYXVsdHMob2JqLCBkZWZhdWx0cykge1xuXHQgIGZvciAodmFyIHAgaW4gZGVmYXVsdHMpIHtcblx0ICAgIHAgaW4gb2JqIHx8IChvYmpbcF0gPSBkZWZhdWx0c1twXSk7XG5cdCAgfVxuXG5cdCAgcmV0dXJuIG9iajtcblx0fSxcblx0ICAgIF9nZXRCb3VuZHMgPSBmdW5jdGlvbiBfZ2V0Qm91bmRzKGVsZW1lbnQsIHdpdGhvdXRUcmFuc2Zvcm1zKSB7XG5cdCAgdmFyIHR3ZWVuID0gd2l0aG91dFRyYW5zZm9ybXMgJiYgX2dldENvbXB1dGVkU3R5bGUoZWxlbWVudClbX3RyYW5zZm9ybVByb3BdICE9PSBcIm1hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKVwiICYmIGdzYXAudG8oZWxlbWVudCwge1xuXHQgICAgeDogMCxcblx0ICAgIHk6IDAsXG5cdCAgICB4UGVyY2VudDogMCxcblx0ICAgIHlQZXJjZW50OiAwLFxuXHQgICAgcm90YXRpb246IDAsXG5cdCAgICByb3RhdGlvblg6IDAsXG5cdCAgICByb3RhdGlvblk6IDAsXG5cdCAgICBzY2FsZTogMSxcblx0ICAgIHNrZXdYOiAwLFxuXHQgICAgc2tld1k6IDBcblx0ICB9KS5wcm9ncmVzcygxKSxcblx0ICAgICAgYm91bmRzID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0ICB0d2VlbiAmJiB0d2Vlbi5wcm9ncmVzcygwKS5raWxsKCk7XG5cdCAgcmV0dXJuIGJvdW5kcztcblx0fSxcblx0ICAgIF9nZXRTaXplID0gZnVuY3Rpb24gX2dldFNpemUoZWxlbWVudCwgX3JlZjQpIHtcblx0ICB2YXIgZDIgPSBfcmVmNC5kMjtcblx0ICByZXR1cm4gZWxlbWVudFtcIm9mZnNldFwiICsgZDJdIHx8IGVsZW1lbnRbXCJjbGllbnRcIiArIGQyXSB8fCAwO1xuXHR9LFxuXHQgICAgX2dldExhYmVsUmF0aW9BcnJheSA9IGZ1bmN0aW9uIF9nZXRMYWJlbFJhdGlvQXJyYXkodGltZWxpbmUpIHtcblx0ICB2YXIgYSA9IFtdLFxuXHQgICAgICBsYWJlbHMgPSB0aW1lbGluZS5sYWJlbHMsXG5cdCAgICAgIGR1cmF0aW9uID0gdGltZWxpbmUuZHVyYXRpb24oKSxcblx0ICAgICAgcDtcblxuXHQgIGZvciAocCBpbiBsYWJlbHMpIHtcblx0ICAgIGEucHVzaChsYWJlbHNbcF0gLyBkdXJhdGlvbik7XG5cdCAgfVxuXG5cdCAgcmV0dXJuIGE7XG5cdH0sXG5cdCAgICBfZ2V0Q2xvc2VzdExhYmVsID0gZnVuY3Rpb24gX2dldENsb3Nlc3RMYWJlbChhbmltYXRpb24pIHtcblx0ICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgICByZXR1cm4gZ3NhcC51dGlscy5zbmFwKF9nZXRMYWJlbFJhdGlvQXJyYXkoYW5pbWF0aW9uKSwgdmFsdWUpO1xuXHQgIH07XG5cdH0sXG5cdCAgICBfc25hcERpcmVjdGlvbmFsID0gZnVuY3Rpb24gX3NuYXBEaXJlY3Rpb25hbChzbmFwSW5jcmVtZW50T3JBcnJheSkge1xuXHQgIHZhciBzbmFwID0gZ3NhcC51dGlscy5zbmFwKHNuYXBJbmNyZW1lbnRPckFycmF5KSxcblx0ICAgICAgYSA9IEFycmF5LmlzQXJyYXkoc25hcEluY3JlbWVudE9yQXJyYXkpICYmIHNuYXBJbmNyZW1lbnRPckFycmF5LnNsaWNlKDApLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcblx0ICAgIHJldHVybiBhIC0gYjtcblx0ICB9KTtcblx0ICByZXR1cm4gYSA/IGZ1bmN0aW9uICh2YWx1ZSwgZGlyZWN0aW9uLCB0aHJlc2hvbGQpIHtcblx0ICAgIGlmICh0aHJlc2hvbGQgPT09IHZvaWQgMCkge1xuXHQgICAgICB0aHJlc2hvbGQgPSAxZS0zO1xuXHQgICAgfVxuXG5cdCAgICB2YXIgaTtcblxuXHQgICAgaWYgKCFkaXJlY3Rpb24pIHtcblx0ICAgICAgcmV0dXJuIHNuYXAodmFsdWUpO1xuXHQgICAgfVxuXG5cdCAgICBpZiAoZGlyZWN0aW9uID4gMCkge1xuXHQgICAgICB2YWx1ZSAtPSB0aHJlc2hvbGQ7XG5cblx0ICAgICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICBpZiAoYVtpXSA+PSB2YWx1ZSkge1xuXHQgICAgICAgICAgcmV0dXJuIGFbaV07XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgcmV0dXJuIGFbaSAtIDFdO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaSA9IGEubGVuZ3RoO1xuXHQgICAgICB2YWx1ZSArPSB0aHJlc2hvbGQ7XG5cblx0ICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgIGlmIChhW2ldIDw9IHZhbHVlKSB7XG5cdCAgICAgICAgICByZXR1cm4gYVtpXTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIGFbMF07XG5cdCAgfSA6IGZ1bmN0aW9uICh2YWx1ZSwgZGlyZWN0aW9uLCB0aHJlc2hvbGQpIHtcblx0ICAgIGlmICh0aHJlc2hvbGQgPT09IHZvaWQgMCkge1xuXHQgICAgICB0aHJlc2hvbGQgPSAxZS0zO1xuXHQgICAgfVxuXG5cdCAgICB2YXIgc25hcHBlZCA9IHNuYXAodmFsdWUpO1xuXHQgICAgcmV0dXJuICFkaXJlY3Rpb24gfHwgTWF0aC5hYnMoc25hcHBlZCAtIHZhbHVlKSA8IHRocmVzaG9sZCB8fCBzbmFwcGVkIC0gdmFsdWUgPCAwID09PSBkaXJlY3Rpb24gPCAwID8gc25hcHBlZCA6IHNuYXAoZGlyZWN0aW9uIDwgMCA/IHZhbHVlIC0gc25hcEluY3JlbWVudE9yQXJyYXkgOiB2YWx1ZSArIHNuYXBJbmNyZW1lbnRPckFycmF5KTtcblx0ICB9O1xuXHR9LFxuXHQgICAgX2dldExhYmVsQXREaXJlY3Rpb24gPSBmdW5jdGlvbiBfZ2V0TGFiZWxBdERpcmVjdGlvbih0aW1lbGluZSkge1xuXHQgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIHN0KSB7XG5cdCAgICByZXR1cm4gX3NuYXBEaXJlY3Rpb25hbChfZ2V0TGFiZWxSYXRpb0FycmF5KHRpbWVsaW5lKSkodmFsdWUsIHN0LmRpcmVjdGlvbik7XG5cdCAgfTtcblx0fSxcblx0ICAgIF9tdWx0aUxpc3RlbmVyID0gZnVuY3Rpb24gX211bHRpTGlzdGVuZXIoZnVuYywgZWxlbWVudCwgdHlwZXMsIGNhbGxiYWNrKSB7XG5cdCAgcmV0dXJuIHR5cGVzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG5cdCAgICByZXR1cm4gZnVuYyhlbGVtZW50LCB0eXBlLCBjYWxsYmFjayk7XG5cdCAgfSk7XG5cdH0sXG5cdCAgICBfYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBfYWRkTGlzdGVuZXIoZWxlbWVudCwgdHlwZSwgZnVuYykge1xuXHQgIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuYywge1xuXHQgICAgcGFzc2l2ZTogdHJ1ZVxuXHQgIH0pO1xuXHR9LFxuXHQgICAgX3JlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gX3JlbW92ZUxpc3RlbmVyKGVsZW1lbnQsIHR5cGUsIGZ1bmMpIHtcblx0ICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZ1bmMpO1xuXHR9LFxuXHQgICAgX21hcmtlckRlZmF1bHRzID0ge1xuXHQgIHN0YXJ0Q29sb3I6IFwiZ3JlZW5cIixcblx0ICBlbmRDb2xvcjogXCJyZWRcIixcblx0ICBpbmRlbnQ6IDAsXG5cdCAgZm9udFNpemU6IFwiMTZweFwiLFxuXHQgIGZvbnRXZWlnaHQ6IFwibm9ybWFsXCJcblx0fSxcblx0ICAgIF9kZWZhdWx0cyA9IHtcblx0ICB0b2dnbGVBY3Rpb25zOiBcInBsYXlcIixcblx0ICBhbnRpY2lwYXRlUGluOiAwXG5cdH0sXG5cdCAgICBfa2V5d29yZHMgPSB7XG5cdCAgdG9wOiAwLFxuXHQgIGxlZnQ6IDAsXG5cdCAgY2VudGVyOiAwLjUsXG5cdCAgYm90dG9tOiAxLFxuXHQgIHJpZ2h0OiAxXG5cdH0sXG5cdCAgICBfb2Zmc2V0VG9QeCA9IGZ1bmN0aW9uIF9vZmZzZXRUb1B4KHZhbHVlLCBzaXplKSB7XG5cdCAgaWYgKF9pc1N0cmluZyh2YWx1ZSkpIHtcblx0ICAgIHZhciBlcUluZGV4ID0gdmFsdWUuaW5kZXhPZihcIj1cIiksXG5cdCAgICAgICAgcmVsYXRpdmUgPSB+ZXFJbmRleCA/ICsodmFsdWUuY2hhckF0KGVxSW5kZXggLSAxKSArIDEpICogcGFyc2VGbG9hdCh2YWx1ZS5zdWJzdHIoZXFJbmRleCArIDEpKSA6IDA7XG5cblx0ICAgIGlmICh+ZXFJbmRleCkge1xuXHQgICAgICB2YWx1ZS5pbmRleE9mKFwiJVwiKSA+IGVxSW5kZXggJiYgKHJlbGF0aXZlICo9IHNpemUgLyAxMDApO1xuXHQgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cigwLCBlcUluZGV4IC0gMSk7XG5cdCAgICB9XG5cblx0ICAgIHZhbHVlID0gcmVsYXRpdmUgKyAodmFsdWUgaW4gX2tleXdvcmRzID8gX2tleXdvcmRzW3ZhbHVlXSAqIHNpemUgOiB+dmFsdWUuaW5kZXhPZihcIiVcIikgPyBwYXJzZUZsb2F0KHZhbHVlKSAqIHNpemUgLyAxMDAgOiBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwKTtcblx0ICB9XG5cblx0ICByZXR1cm4gdmFsdWU7XG5cdH0sXG5cdCAgICBfY3JlYXRlTWFya2VyID0gZnVuY3Rpb24gX2NyZWF0ZU1hcmtlcih0eXBlLCBuYW1lLCBjb250YWluZXIsIGRpcmVjdGlvbiwgX3JlZjUsIG9mZnNldCwgbWF0Y2hXaWR0aEVsLCBjb250YWluZXJBbmltYXRpb24pIHtcblx0ICB2YXIgc3RhcnRDb2xvciA9IF9yZWY1LnN0YXJ0Q29sb3IsXG5cdCAgICAgIGVuZENvbG9yID0gX3JlZjUuZW5kQ29sb3IsXG5cdCAgICAgIGZvbnRTaXplID0gX3JlZjUuZm9udFNpemUsXG5cdCAgICAgIGluZGVudCA9IF9yZWY1LmluZGVudCxcblx0ICAgICAgZm9udFdlaWdodCA9IF9yZWY1LmZvbnRXZWlnaHQ7XG5cblx0ICB2YXIgZSA9IF9kb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcblx0ICAgICAgdXNlRml4ZWRQb3NpdGlvbiA9IF9pc1ZpZXdwb3J0KGNvbnRhaW5lcikgfHwgX2dldFByb3h5UHJvcChjb250YWluZXIsIFwicGluVHlwZVwiKSA9PT0gXCJmaXhlZFwiLFxuXHQgICAgICBpc1Njcm9sbGVyID0gdHlwZS5pbmRleE9mKFwic2Nyb2xsZXJcIikgIT09IC0xLFxuXHQgICAgICBwYXJlbnQgPSB1c2VGaXhlZFBvc2l0aW9uID8gX2JvZHkgOiBjb250YWluZXIsXG5cdCAgICAgIGlzU3RhcnQgPSB0eXBlLmluZGV4T2YoXCJzdGFydFwiKSAhPT0gLTEsXG5cdCAgICAgIGNvbG9yID0gaXNTdGFydCA/IHN0YXJ0Q29sb3IgOiBlbmRDb2xvcixcblx0ICAgICAgY3NzID0gXCJib3JkZXItY29sb3I6XCIgKyBjb2xvciArIFwiO2ZvbnQtc2l6ZTpcIiArIGZvbnRTaXplICsgXCI7Y29sb3I6XCIgKyBjb2xvciArIFwiO2ZvbnQtd2VpZ2h0OlwiICsgZm9udFdlaWdodCArIFwiO3BvaW50ZXItZXZlbnRzOm5vbmU7d2hpdGUtc3BhY2U6bm93cmFwO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWYsQXJpYWw7ei1pbmRleDoxMDAwO3BhZGRpbmc6NHB4IDhweDtib3JkZXItd2lkdGg6MDtib3JkZXItc3R5bGU6c29saWQ7XCI7XG5cblx0ICBjc3MgKz0gXCJwb3NpdGlvbjpcIiArICgoaXNTY3JvbGxlciB8fCBjb250YWluZXJBbmltYXRpb24pICYmIHVzZUZpeGVkUG9zaXRpb24gPyBcImZpeGVkO1wiIDogXCJhYnNvbHV0ZTtcIik7XG5cdCAgKGlzU2Nyb2xsZXIgfHwgY29udGFpbmVyQW5pbWF0aW9uIHx8ICF1c2VGaXhlZFBvc2l0aW9uKSAmJiAoY3NzICs9IChkaXJlY3Rpb24gPT09IF92ZXJ0aWNhbCA/IF9yaWdodCA6IF9ib3R0b20pICsgXCI6XCIgKyAob2Zmc2V0ICsgcGFyc2VGbG9hdChpbmRlbnQpKSArIFwicHg7XCIpO1xuXHQgIG1hdGNoV2lkdGhFbCAmJiAoY3NzICs9IFwiYm94LXNpemluZzpib3JkZXItYm94O3RleHQtYWxpZ246bGVmdDt3aWR0aDpcIiArIG1hdGNoV2lkdGhFbC5vZmZzZXRXaWR0aCArIFwicHg7XCIpO1xuXHQgIGUuX2lzU3RhcnQgPSBpc1N0YXJ0O1xuXHQgIGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJnc2FwLW1hcmtlci1cIiArIHR5cGUgKyAobmFtZSA/IFwiIG1hcmtlci1cIiArIG5hbWUgOiBcIlwiKSk7XG5cdCAgZS5zdHlsZS5jc3NUZXh0ID0gY3NzO1xuXHQgIGUuaW5uZXJUZXh0ID0gbmFtZSB8fCBuYW1lID09PSAwID8gdHlwZSArIFwiLVwiICsgbmFtZSA6IHR5cGU7XG5cdCAgcGFyZW50LmNoaWxkcmVuWzBdID8gcGFyZW50Lmluc2VydEJlZm9yZShlLCBwYXJlbnQuY2hpbGRyZW5bMF0pIDogcGFyZW50LmFwcGVuZENoaWxkKGUpO1xuXHQgIGUuX29mZnNldCA9IGVbXCJvZmZzZXRcIiArIGRpcmVjdGlvbi5vcC5kMl07XG5cblx0ICBfcG9zaXRpb25NYXJrZXIoZSwgMCwgZGlyZWN0aW9uLCBpc1N0YXJ0KTtcblxuXHQgIHJldHVybiBlO1xuXHR9LFxuXHQgICAgX3Bvc2l0aW9uTWFya2VyID0gZnVuY3Rpb24gX3Bvc2l0aW9uTWFya2VyKG1hcmtlciwgc3RhcnQsIGRpcmVjdGlvbiwgZmxpcHBlZCkge1xuXHQgIHZhciB2YXJzID0ge1xuXHQgICAgZGlzcGxheTogXCJibG9ja1wiXG5cdCAgfSxcblx0ICAgICAgc2lkZSA9IGRpcmVjdGlvbltmbGlwcGVkID8gXCJvczJcIiA6IFwicDJcIl0sXG5cdCAgICAgIG9wcG9zaXRlU2lkZSA9IGRpcmVjdGlvbltmbGlwcGVkID8gXCJwMlwiIDogXCJvczJcIl07XG5cdCAgbWFya2VyLl9pc0ZsaXBwZWQgPSBmbGlwcGVkO1xuXHQgIHZhcnNbZGlyZWN0aW9uLmEgKyBcIlBlcmNlbnRcIl0gPSBmbGlwcGVkID8gLTEwMCA6IDA7XG5cdCAgdmFyc1tkaXJlY3Rpb24uYV0gPSBmbGlwcGVkID8gXCIxcHhcIiA6IDA7XG5cdCAgdmFyc1tcImJvcmRlclwiICsgc2lkZSArIF9XaWR0aF0gPSAxO1xuXHQgIHZhcnNbXCJib3JkZXJcIiArIG9wcG9zaXRlU2lkZSArIF9XaWR0aF0gPSAwO1xuXHQgIHZhcnNbZGlyZWN0aW9uLnBdID0gc3RhcnQgKyBcInB4XCI7XG5cdCAgZ3NhcC5zZXQobWFya2VyLCB2YXJzKTtcblx0fSxcblx0ICAgIF90cmlnZ2VycyA9IFtdLFxuXHQgICAgX2lkcyA9IHt9LFxuXHQgICAgX3N5bmMgPSBmdW5jdGlvbiBfc3luYygpIHtcblx0ICByZXR1cm4gX2dldFRpbWUoKSAtIF9sYXN0U2Nyb2xsVGltZSA+IDM0ICYmIF91cGRhdGVBbGwoKTtcblx0fSxcblx0ICAgIF9vblNjcm9sbCA9IGZ1bmN0aW9uIF9vblNjcm9sbCgpIHtcblx0ICBfdXBkYXRlQWxsKCk7XG5cblx0ICBfbGFzdFNjcm9sbFRpbWUgfHwgX2Rpc3BhdGNoKFwic2Nyb2xsU3RhcnRcIik7XG5cdCAgX2xhc3RTY3JvbGxUaW1lID0gX2dldFRpbWUoKTtcblx0fSxcblx0ICAgIF9vblJlc2l6ZSA9IGZ1bmN0aW9uIF9vblJlc2l6ZSgpIHtcblx0ICByZXR1cm4gIV9yZWZyZXNoaW5nICYmICFfaWdub3JlUmVzaXplICYmICFfZG9jLmZ1bGxzY3JlZW5FbGVtZW50ICYmIF9yZXNpemVEZWxheS5yZXN0YXJ0KHRydWUpO1xuXHR9LFxuXHQgICAgX2xpc3RlbmVycyA9IHt9LFxuXHQgICAgX2VtcHR5QXJyYXkgPSBbXSxcblx0ICAgIF9tZWRpYSA9IFtdLFxuXHQgICAgX2NyZWF0aW5nTWVkaWEsXG5cdCAgICBfbGFzdE1lZGlhVGljayxcblx0ICAgIF9vbk1lZGlhQ2hhbmdlID0gZnVuY3Rpb24gX29uTWVkaWFDaGFuZ2UoZSkge1xuXHQgIHZhciB0aWNrID0gZ3NhcC50aWNrZXIuZnJhbWUsXG5cdCAgICAgIG1hdGNoZXMgPSBbXSxcblx0ICAgICAgaSA9IDAsXG5cdCAgICAgIGluZGV4O1xuXG5cdCAgaWYgKF9sYXN0TWVkaWFUaWNrICE9PSB0aWNrIHx8IF9zdGFydHVwKSB7XG5cdCAgICBfcmV2ZXJ0QWxsKCk7XG5cblx0ICAgIGZvciAoOyBpIDwgX21lZGlhLmxlbmd0aDsgaSArPSA0KSB7XG5cdCAgICAgIGluZGV4ID0gX3dpbi5tYXRjaE1lZGlhKF9tZWRpYVtpXSkubWF0Y2hlcztcblxuXHQgICAgICBpZiAoaW5kZXggIT09IF9tZWRpYVtpICsgM10pIHtcblx0ICAgICAgICBfbWVkaWFbaSArIDNdID0gaW5kZXg7XG5cdCAgICAgICAgaW5kZXggPyBtYXRjaGVzLnB1c2goaSkgOiBfcmV2ZXJ0QWxsKDEsIF9tZWRpYVtpXSkgfHwgX2lzRnVuY3Rpb24oX21lZGlhW2kgKyAyXSkgJiYgX21lZGlhW2kgKyAyXSgpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIF9yZXZlcnRSZWNvcmRlZCgpO1xuXG5cdCAgICBmb3IgKGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykge1xuXHQgICAgICBpbmRleCA9IG1hdGNoZXNbaV07XG5cdCAgICAgIF9jcmVhdGluZ01lZGlhID0gX21lZGlhW2luZGV4XTtcblx0ICAgICAgX21lZGlhW2luZGV4ICsgMl0gPSBfbWVkaWFbaW5kZXggKyAxXShlKTtcblx0ICAgIH1cblxuXHQgICAgX2NyZWF0aW5nTWVkaWEgPSAwO1xuXHQgICAgX2NvcmVJbml0dGVkICYmIF9yZWZyZXNoQWxsKDAsIDEpO1xuXHQgICAgX2xhc3RNZWRpYVRpY2sgPSB0aWNrO1xuXG5cdCAgICBfZGlzcGF0Y2goXCJtYXRjaE1lZGlhXCIpO1xuXHQgIH1cblx0fSxcblx0ICAgIF9zb2Z0UmVmcmVzaCA9IGZ1bmN0aW9uIF9zb2Z0UmVmcmVzaCgpIHtcblx0ICByZXR1cm4gX3JlbW92ZUxpc3RlbmVyKFNjcm9sbFRyaWdnZXIsIFwic2Nyb2xsRW5kXCIsIF9zb2Z0UmVmcmVzaCkgfHwgX3JlZnJlc2hBbGwodHJ1ZSk7XG5cdH0sXG5cdCAgICBfZGlzcGF0Y2ggPSBmdW5jdGlvbiBfZGlzcGF0Y2godHlwZSkge1xuXHQgIHJldHVybiBfbGlzdGVuZXJzW3R5cGVdICYmIF9saXN0ZW5lcnNbdHlwZV0ubWFwKGZ1bmN0aW9uIChmKSB7XG5cdCAgICByZXR1cm4gZigpO1xuXHQgIH0pIHx8IF9lbXB0eUFycmF5O1xuXHR9LFxuXHQgICAgX3NhdmVkU3R5bGVzID0gW10sXG5cdCAgICBfcmV2ZXJ0UmVjb3JkZWQgPSBmdW5jdGlvbiBfcmV2ZXJ0UmVjb3JkZWQobWVkaWEpIHtcblx0ICBmb3IgKHZhciBpID0gMDsgaSA8IF9zYXZlZFN0eWxlcy5sZW5ndGg7IGkgKz0gNSkge1xuXHQgICAgaWYgKCFtZWRpYSB8fCBfc2F2ZWRTdHlsZXNbaSArIDRdID09PSBtZWRpYSkge1xuXHQgICAgICBfc2F2ZWRTdHlsZXNbaV0uc3R5bGUuY3NzVGV4dCA9IF9zYXZlZFN0eWxlc1tpICsgMV07XG5cdCAgICAgIF9zYXZlZFN0eWxlc1tpXS5nZXRCQm94ICYmIF9zYXZlZFN0eWxlc1tpXS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgX3NhdmVkU3R5bGVzW2kgKyAyXSB8fCBcIlwiKTtcblx0ICAgICAgX3NhdmVkU3R5bGVzW2kgKyAzXS51bmNhY2hlID0gMTtcblx0ICAgIH1cblx0ICB9XG5cdH0sXG5cdCAgICBfcmV2ZXJ0QWxsID0gZnVuY3Rpb24gX3JldmVydEFsbChraWxsLCBtZWRpYSkge1xuXHQgIHZhciB0cmlnZ2VyO1xuXG5cdCAgZm9yIChfaSA9IDA7IF9pIDwgX3RyaWdnZXJzLmxlbmd0aDsgX2krKykge1xuXHQgICAgdHJpZ2dlciA9IF90cmlnZ2Vyc1tfaV07XG5cblx0ICAgIGlmICghbWVkaWEgfHwgdHJpZ2dlci5tZWRpYSA9PT0gbWVkaWEpIHtcblx0ICAgICAgaWYgKGtpbGwpIHtcblx0ICAgICAgICB0cmlnZ2VyLmtpbGwoMSk7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgdHJpZ2dlci5yZXZlcnQoKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblxuXHQgIG1lZGlhICYmIF9yZXZlcnRSZWNvcmRlZChtZWRpYSk7XG5cdCAgbWVkaWEgfHwgX2Rpc3BhdGNoKFwicmV2ZXJ0XCIpO1xuXHR9LFxuXHQgICAgX2NsZWFyU2Nyb2xsTWVtb3J5ID0gZnVuY3Rpb24gX2NsZWFyU2Nyb2xsTWVtb3J5KCkge1xuXHQgIHJldHVybiBfc2Nyb2xsZXJzLmZvckVhY2goZnVuY3Rpb24gKG9iaikge1xuXHQgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIiAmJiAob2JqLnJlYyA9IDApO1xuXHQgIH0pO1xuXHR9LFxuXHQgICAgX3JlZnJlc2hpbmdBbGwsXG5cdCAgICBfcmVmcmVzaEFsbCA9IGZ1bmN0aW9uIF9yZWZyZXNoQWxsKGZvcmNlLCBza2lwUmV2ZXJ0KSB7XG5cdCAgaWYgKF9sYXN0U2Nyb2xsVGltZSAmJiAhZm9yY2UpIHtcblx0ICAgIF9hZGRMaXN0ZW5lcihTY3JvbGxUcmlnZ2VyLCBcInNjcm9sbEVuZFwiLCBfc29mdFJlZnJlc2gpO1xuXG5cdCAgICByZXR1cm47XG5cdCAgfVxuXG5cdCAgX3JlZnJlc2hpbmdBbGwgPSB0cnVlO1xuXG5cdCAgdmFyIHJlZnJlc2hJbml0cyA9IF9kaXNwYXRjaChcInJlZnJlc2hJbml0XCIpO1xuXG5cdCAgX3NvcnQgJiYgU2Nyb2xsVHJpZ2dlci5zb3J0KCk7XG5cdCAgc2tpcFJldmVydCB8fCBfcmV2ZXJ0QWxsKCk7XG5cblx0ICBfdHJpZ2dlcnMuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuXHQgICAgcmV0dXJuIHQucmVmcmVzaCgpO1xuXHQgIH0pO1xuXG5cdCAgX3RyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcblx0ICAgIHJldHVybiB0LnZhcnMuZW5kID09PSBcIm1heFwiICYmIHQuc2V0UG9zaXRpb25zKHQuc3RhcnQsIF9tYXhTY3JvbGwodC5zY3JvbGxlciwgdC5fZGlyKSk7XG5cdCAgfSk7XG5cblx0ICByZWZyZXNoSW5pdHMuZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XG5cdCAgICByZXR1cm4gcmVzdWx0ICYmIHJlc3VsdC5yZW5kZXIgJiYgcmVzdWx0LnJlbmRlcigtMSk7XG5cdCAgfSk7XG5cblx0ICBfY2xlYXJTY3JvbGxNZW1vcnkoKTtcblxuXHQgIF9yZXNpemVEZWxheS5wYXVzZSgpO1xuXG5cdCAgX3JlZnJlc2hpbmdBbGwgPSBmYWxzZTtcblxuXHQgIF9kaXNwYXRjaChcInJlZnJlc2hcIik7XG5cdH0sXG5cdCAgICBfbGFzdFNjcm9sbCA9IDAsXG5cdCAgICBfZGlyZWN0aW9uID0gMSxcblx0ICAgIF91cGRhdGVBbGwgPSBmdW5jdGlvbiBfdXBkYXRlQWxsKCkge1xuXHQgIGlmICghX3JlZnJlc2hpbmdBbGwpIHtcblx0ICAgIHZhciBsID0gX3RyaWdnZXJzLmxlbmd0aCxcblx0ICAgICAgICB0aW1lID0gX2dldFRpbWUoKSxcblx0ICAgICAgICByZWNvcmRWZWxvY2l0eSA9IHRpbWUgLSBfdGltZTEgPj0gNTAsXG5cdCAgICAgICAgc2Nyb2xsID0gbCAmJiBfdHJpZ2dlcnNbMF0uc2Nyb2xsKCk7XG5cblx0ICAgIF9kaXJlY3Rpb24gPSBfbGFzdFNjcm9sbCA+IHNjcm9sbCA/IC0xIDogMTtcblx0ICAgIF9sYXN0U2Nyb2xsID0gc2Nyb2xsO1xuXG5cdCAgICBpZiAocmVjb3JkVmVsb2NpdHkpIHtcblx0ICAgICAgaWYgKF9sYXN0U2Nyb2xsVGltZSAmJiAhX3BvaW50ZXJJc0Rvd24gJiYgdGltZSAtIF9sYXN0U2Nyb2xsVGltZSA+IDIwMCkge1xuXHQgICAgICAgIF9sYXN0U2Nyb2xsVGltZSA9IDA7XG5cblx0ICAgICAgICBfZGlzcGF0Y2goXCJzY3JvbGxFbmRcIik7XG5cdCAgICAgIH1cblxuXHQgICAgICBfdGltZTIgPSBfdGltZTE7XG5cdCAgICAgIF90aW1lMSA9IHRpbWU7XG5cdCAgICB9XG5cblx0ICAgIGlmIChfZGlyZWN0aW9uIDwgMCkge1xuXHQgICAgICBfaSA9IGw7XG5cblx0ICAgICAgd2hpbGUgKF9pLS0gPiAwKSB7XG5cdCAgICAgICAgX3RyaWdnZXJzW19pXSAmJiBfdHJpZ2dlcnNbX2ldLnVwZGF0ZSgwLCByZWNvcmRWZWxvY2l0eSk7XG5cdCAgICAgIH1cblxuXHQgICAgICBfZGlyZWN0aW9uID0gMTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGZvciAoX2kgPSAwOyBfaSA8IGw7IF9pKyspIHtcblx0ICAgICAgICBfdHJpZ2dlcnNbX2ldICYmIF90cmlnZ2Vyc1tfaV0udXBkYXRlKDAsIHJlY29yZFZlbG9jaXR5KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0fSxcblx0ICAgIF9wcm9wTmFtZXNUb0NvcHkgPSBbX2xlZnQsIF90b3AsIF9ib3R0b20sIF9yaWdodCwgX21hcmdpbiArIF9Cb3R0b20sIF9tYXJnaW4gKyBfUmlnaHQsIF9tYXJnaW4gKyBfVG9wLCBfbWFyZ2luICsgX0xlZnQsIFwiZGlzcGxheVwiLCBcImZsZXhTaHJpbmtcIiwgXCJmbG9hdFwiLCBcInpJbmRleFwiLCBcImdyaWRDb2x1bW5TdGFydFwiLCBcImdyaWRDb2x1bW5FbmRcIiwgXCJncmlkUm93U3RhcnRcIiwgXCJncmlkUm93RW5kXCIsIFwiZ3JpZEFyZWFcIiwgXCJqdXN0aWZ5U2VsZlwiLCBcImFsaWduU2VsZlwiLCBcInBsYWNlU2VsZlwiLCBcIm9yZGVyXCJdLFxuXHQgICAgX3N0YXRlUHJvcHMgPSBfcHJvcE5hbWVzVG9Db3B5LmNvbmNhdChbX3dpZHRoLCBfaGVpZ2h0LCBcImJveFNpemluZ1wiLCBcIm1heFwiICsgX1dpZHRoLCBcIm1heFwiICsgX0hlaWdodCwgXCJwb3NpdGlvblwiLCBfbWFyZ2luLCBfcGFkZGluZywgX3BhZGRpbmcgKyBfVG9wLCBfcGFkZGluZyArIF9SaWdodCwgX3BhZGRpbmcgKyBfQm90dG9tLCBfcGFkZGluZyArIF9MZWZ0XSksXG5cdCAgICBfc3dhcFBpbk91dCA9IGZ1bmN0aW9uIF9zd2FwUGluT3V0KHBpbiwgc3BhY2VyLCBzdGF0ZSkge1xuXHQgIF9zZXRTdGF0ZShzdGF0ZSk7XG5cblx0ICB2YXIgY2FjaGUgPSBwaW4uX2dzYXA7XG5cblx0ICBpZiAoY2FjaGUuc3BhY2VySXNOYXRpdmUpIHtcblx0ICAgIF9zZXRTdGF0ZShjYWNoZS5zcGFjZXJTdGF0ZSk7XG5cdCAgfSBlbHNlIGlmIChwaW4ucGFyZW50Tm9kZSA9PT0gc3BhY2VyKSB7XG5cdCAgICB2YXIgcGFyZW50ID0gc3BhY2VyLnBhcmVudE5vZGU7XG5cblx0ICAgIGlmIChwYXJlbnQpIHtcblx0ICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShwaW4sIHNwYWNlcik7XG5cdCAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChzcGFjZXIpO1xuXHQgICAgfVxuXHQgIH1cblx0fSxcblx0ICAgIF9zd2FwUGluSW4gPSBmdW5jdGlvbiBfc3dhcFBpbkluKHBpbiwgc3BhY2VyLCBjcywgc3BhY2VyU3RhdGUpIHtcblx0ICBpZiAocGluLnBhcmVudE5vZGUgIT09IHNwYWNlcikge1xuXHQgICAgdmFyIGkgPSBfcHJvcE5hbWVzVG9Db3B5Lmxlbmd0aCxcblx0ICAgICAgICBzcGFjZXJTdHlsZSA9IHNwYWNlci5zdHlsZSxcblx0ICAgICAgICBwaW5TdHlsZSA9IHBpbi5zdHlsZSxcblx0ICAgICAgICBwO1xuXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIHAgPSBfcHJvcE5hbWVzVG9Db3B5W2ldO1xuXHQgICAgICBzcGFjZXJTdHlsZVtwXSA9IGNzW3BdO1xuXHQgICAgfVxuXG5cdCAgICBzcGFjZXJTdHlsZS5wb3NpdGlvbiA9IGNzLnBvc2l0aW9uID09PSBcImFic29sdXRlXCIgPyBcImFic29sdXRlXCIgOiBcInJlbGF0aXZlXCI7XG5cdCAgICBjcy5kaXNwbGF5ID09PSBcImlubGluZVwiICYmIChzcGFjZXJTdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIik7XG5cdCAgICBwaW5TdHlsZVtfYm90dG9tXSA9IHBpblN0eWxlW19yaWdodF0gPSBzcGFjZXJTdHlsZS5mbGV4QmFzaXMgPSBcImF1dG9cIjtcblx0ICAgIHNwYWNlclN0eWxlLm92ZXJmbG93ID0gXCJ2aXNpYmxlXCI7XG5cdCAgICBzcGFjZXJTdHlsZS5ib3hTaXppbmcgPSBcImJvcmRlci1ib3hcIjtcblx0ICAgIHNwYWNlclN0eWxlW193aWR0aF0gPSBfZ2V0U2l6ZShwaW4sIF9ob3Jpem9udGFsKSArIF9weDtcblx0ICAgIHNwYWNlclN0eWxlW19oZWlnaHRdID0gX2dldFNpemUocGluLCBfdmVydGljYWwpICsgX3B4O1xuXHQgICAgc3BhY2VyU3R5bGVbX3BhZGRpbmddID0gcGluU3R5bGVbX21hcmdpbl0gPSBwaW5TdHlsZVtfdG9wXSA9IHBpblN0eWxlW19sZWZ0XSA9IFwiMFwiO1xuXG5cdCAgICBfc2V0U3RhdGUoc3BhY2VyU3RhdGUpO1xuXG5cdCAgICBwaW5TdHlsZVtfd2lkdGhdID0gcGluU3R5bGVbXCJtYXhcIiArIF9XaWR0aF0gPSBjc1tfd2lkdGhdO1xuXHQgICAgcGluU3R5bGVbX2hlaWdodF0gPSBwaW5TdHlsZVtcIm1heFwiICsgX0hlaWdodF0gPSBjc1tfaGVpZ2h0XTtcblx0ICAgIHBpblN0eWxlW19wYWRkaW5nXSA9IGNzW19wYWRkaW5nXTtcblx0ICAgIHBpbi5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzcGFjZXIsIHBpbik7XG5cdCAgICBzcGFjZXIuYXBwZW5kQ2hpbGQocGluKTtcblx0ICB9XG5cdH0sXG5cdCAgICBfY2Fwc0V4cCA9IC8oW0EtWl0pL2csXG5cdCAgICBfc2V0U3RhdGUgPSBmdW5jdGlvbiBfc2V0U3RhdGUoc3RhdGUpIHtcblx0ICBpZiAoc3RhdGUpIHtcblx0ICAgIHZhciBzdHlsZSA9IHN0YXRlLnQuc3R5bGUsXG5cdCAgICAgICAgbCA9IHN0YXRlLmxlbmd0aCxcblx0ICAgICAgICBpID0gMCxcblx0ICAgICAgICBwLFxuXHQgICAgICAgIHZhbHVlO1xuXHQgICAgKHN0YXRlLnQuX2dzYXAgfHwgZ3NhcC5jb3JlLmdldENhY2hlKHN0YXRlLnQpKS51bmNhY2hlID0gMTtcblxuXHQgICAgZm9yICg7IGkgPCBsOyBpICs9IDIpIHtcblx0ICAgICAgdmFsdWUgPSBzdGF0ZVtpICsgMV07XG5cdCAgICAgIHAgPSBzdGF0ZVtpXTtcblxuXHQgICAgICBpZiAodmFsdWUpIHtcblx0ICAgICAgICBzdHlsZVtwXSA9IHZhbHVlO1xuXHQgICAgICB9IGVsc2UgaWYgKHN0eWxlW3BdKSB7XG5cdCAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkocC5yZXBsYWNlKF9jYXBzRXhwLCBcIi0kMVwiKS50b0xvd2VyQ2FzZSgpKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0fSxcblx0ICAgIF9nZXRTdGF0ZSA9IGZ1bmN0aW9uIF9nZXRTdGF0ZShlbGVtZW50KSB7XG5cdCAgdmFyIGwgPSBfc3RhdGVQcm9wcy5sZW5ndGgsXG5cdCAgICAgIHN0eWxlID0gZWxlbWVudC5zdHlsZSxcblx0ICAgICAgc3RhdGUgPSBbXSxcblx0ICAgICAgaSA9IDA7XG5cblx0ICBmb3IgKDsgaSA8IGw7IGkrKykge1xuXHQgICAgc3RhdGUucHVzaChfc3RhdGVQcm9wc1tpXSwgc3R5bGVbX3N0YXRlUHJvcHNbaV1dKTtcblx0ICB9XG5cblx0ICBzdGF0ZS50ID0gZWxlbWVudDtcblx0ICByZXR1cm4gc3RhdGU7XG5cdH0sXG5cdCAgICBfY29weVN0YXRlID0gZnVuY3Rpb24gX2NvcHlTdGF0ZShzdGF0ZSwgb3ZlcnJpZGUsIG9taXRPZmZzZXRzKSB7XG5cdCAgdmFyIHJlc3VsdCA9IFtdLFxuXHQgICAgICBsID0gc3RhdGUubGVuZ3RoLFxuXHQgICAgICBpID0gb21pdE9mZnNldHMgPyA4IDogMCxcblx0ICAgICAgcDtcblxuXHQgIGZvciAoOyBpIDwgbDsgaSArPSAyKSB7XG5cdCAgICBwID0gc3RhdGVbaV07XG5cdCAgICByZXN1bHQucHVzaChwLCBwIGluIG92ZXJyaWRlID8gb3ZlcnJpZGVbcF0gOiBzdGF0ZVtpICsgMV0pO1xuXHQgIH1cblxuXHQgIHJlc3VsdC50ID0gc3RhdGUudDtcblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHQgICAgX3dpbk9mZnNldHMgPSB7XG5cdCAgbGVmdDogMCxcblx0ICB0b3A6IDBcblx0fSxcblx0ICAgIF9wYXJzZVBvc2l0aW9uID0gZnVuY3Rpb24gX3BhcnNlUG9zaXRpb24odmFsdWUsIHRyaWdnZXIsIHNjcm9sbGVyU2l6ZSwgZGlyZWN0aW9uLCBzY3JvbGwsIG1hcmtlciwgbWFya2VyU2Nyb2xsZXIsIHNlbGYsIHNjcm9sbGVyQm91bmRzLCBib3JkZXJXaWR0aCwgdXNlRml4ZWRQb3NpdGlvbiwgc2Nyb2xsZXJNYXgsIGNvbnRhaW5lckFuaW1hdGlvbikge1xuXHQgIF9pc0Z1bmN0aW9uKHZhbHVlKSAmJiAodmFsdWUgPSB2YWx1ZShzZWxmKSk7XG5cblx0ICBpZiAoX2lzU3RyaW5nKHZhbHVlKSAmJiB2YWx1ZS5zdWJzdHIoMCwgMykgPT09IFwibWF4XCIpIHtcblx0ICAgIHZhbHVlID0gc2Nyb2xsZXJNYXggKyAodmFsdWUuY2hhckF0KDQpID09PSBcIj1cIiA/IF9vZmZzZXRUb1B4KFwiMFwiICsgdmFsdWUuc3Vic3RyKDMpLCBzY3JvbGxlclNpemUpIDogMCk7XG5cdCAgfVxuXG5cdCAgdmFyIHRpbWUgPSBjb250YWluZXJBbmltYXRpb24gPyBjb250YWluZXJBbmltYXRpb24udGltZSgpIDogMCxcblx0ICAgICAgcDEsXG5cdCAgICAgIHAyLFxuXHQgICAgICBlbGVtZW50O1xuXHQgIGNvbnRhaW5lckFuaW1hdGlvbiAmJiBjb250YWluZXJBbmltYXRpb24uc2VlaygwKTtcblxuXHQgIGlmICghX2lzTnVtYmVyKHZhbHVlKSkge1xuXHQgICAgX2lzRnVuY3Rpb24odHJpZ2dlcikgJiYgKHRyaWdnZXIgPSB0cmlnZ2VyKHNlbGYpKTtcblx0ICAgIHZhciBvZmZzZXRzID0gdmFsdWUuc3BsaXQoXCIgXCIpLFxuXHQgICAgICAgIGJvdW5kcyxcblx0ICAgICAgICBsb2NhbE9mZnNldCxcblx0ICAgICAgICBnbG9iYWxPZmZzZXQsXG5cdCAgICAgICAgZGlzcGxheTtcblx0ICAgIGVsZW1lbnQgPSBfZ2V0VGFyZ2V0KHRyaWdnZXIpIHx8IF9ib2R5O1xuXHQgICAgYm91bmRzID0gX2dldEJvdW5kcyhlbGVtZW50KSB8fCB7fTtcblxuXHQgICAgaWYgKCghYm91bmRzIHx8ICFib3VuZHMubGVmdCAmJiAhYm91bmRzLnRvcCkgJiYgX2dldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZGlzcGxheSA9PT0gXCJub25lXCIpIHtcblx0ICAgICAgZGlzcGxheSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheTtcblx0ICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXHQgICAgICBib3VuZHMgPSBfZ2V0Qm91bmRzKGVsZW1lbnQpO1xuXHQgICAgICBkaXNwbGF5ID8gZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheSA6IGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoXCJkaXNwbGF5XCIpO1xuXHQgICAgfVxuXG5cdCAgICBsb2NhbE9mZnNldCA9IF9vZmZzZXRUb1B4KG9mZnNldHNbMF0sIGJvdW5kc1tkaXJlY3Rpb24uZF0pO1xuXHQgICAgZ2xvYmFsT2Zmc2V0ID0gX29mZnNldFRvUHgob2Zmc2V0c1sxXSB8fCBcIjBcIiwgc2Nyb2xsZXJTaXplKTtcblx0ICAgIHZhbHVlID0gYm91bmRzW2RpcmVjdGlvbi5wXSAtIHNjcm9sbGVyQm91bmRzW2RpcmVjdGlvbi5wXSAtIGJvcmRlcldpZHRoICsgbG9jYWxPZmZzZXQgKyBzY3JvbGwgLSBnbG9iYWxPZmZzZXQ7XG5cdCAgICBtYXJrZXJTY3JvbGxlciAmJiBfcG9zaXRpb25NYXJrZXIobWFya2VyU2Nyb2xsZXIsIGdsb2JhbE9mZnNldCwgZGlyZWN0aW9uLCBzY3JvbGxlclNpemUgLSBnbG9iYWxPZmZzZXQgPCAyMCB8fCBtYXJrZXJTY3JvbGxlci5faXNTdGFydCAmJiBnbG9iYWxPZmZzZXQgPiAyMCk7XG5cdCAgICBzY3JvbGxlclNpemUgLT0gc2Nyb2xsZXJTaXplIC0gZ2xvYmFsT2Zmc2V0O1xuXHQgIH0gZWxzZSBpZiAobWFya2VyU2Nyb2xsZXIpIHtcblx0ICAgIF9wb3NpdGlvbk1hcmtlcihtYXJrZXJTY3JvbGxlciwgc2Nyb2xsZXJTaXplLCBkaXJlY3Rpb24sIHRydWUpO1xuXHQgIH1cblxuXHQgIGlmIChtYXJrZXIpIHtcblx0ICAgIHZhciBwb3NpdGlvbiA9IHZhbHVlICsgc2Nyb2xsZXJTaXplLFxuXHQgICAgICAgIGlzU3RhcnQgPSBtYXJrZXIuX2lzU3RhcnQ7XG5cdCAgICBwMSA9IFwic2Nyb2xsXCIgKyBkaXJlY3Rpb24uZDI7XG5cblx0ICAgIF9wb3NpdGlvbk1hcmtlcihtYXJrZXIsIHBvc2l0aW9uLCBkaXJlY3Rpb24sIGlzU3RhcnQgJiYgcG9zaXRpb24gPiAyMCB8fCAhaXNTdGFydCAmJiAodXNlRml4ZWRQb3NpdGlvbiA/IE1hdGgubWF4KF9ib2R5W3AxXSwgX2RvY0VsW3AxXSkgOiBtYXJrZXIucGFyZW50Tm9kZVtwMV0pIDw9IHBvc2l0aW9uICsgMSk7XG5cblx0ICAgIGlmICh1c2VGaXhlZFBvc2l0aW9uKSB7XG5cdCAgICAgIHNjcm9sbGVyQm91bmRzID0gX2dldEJvdW5kcyhtYXJrZXJTY3JvbGxlcik7XG5cdCAgICAgIHVzZUZpeGVkUG9zaXRpb24gJiYgKG1hcmtlci5zdHlsZVtkaXJlY3Rpb24ub3AucF0gPSBzY3JvbGxlckJvdW5kc1tkaXJlY3Rpb24ub3AucF0gLSBkaXJlY3Rpb24ub3AubSAtIG1hcmtlci5fb2Zmc2V0ICsgX3B4KTtcblx0ICAgIH1cblx0ICB9XG5cblx0ICBpZiAoY29udGFpbmVyQW5pbWF0aW9uICYmIGVsZW1lbnQpIHtcblx0ICAgIHAxID0gX2dldEJvdW5kcyhlbGVtZW50KTtcblx0ICAgIGNvbnRhaW5lckFuaW1hdGlvbi5zZWVrKHNjcm9sbGVyTWF4KTtcblx0ICAgIHAyID0gX2dldEJvdW5kcyhlbGVtZW50KTtcblx0ICAgIGNvbnRhaW5lckFuaW1hdGlvbi5fY2FTY3JvbGxEaXN0ID0gcDFbZGlyZWN0aW9uLnBdIC0gcDJbZGlyZWN0aW9uLnBdO1xuXHQgICAgdmFsdWUgPSB2YWx1ZSAvIGNvbnRhaW5lckFuaW1hdGlvbi5fY2FTY3JvbGxEaXN0ICogc2Nyb2xsZXJNYXg7XG5cdCAgfVxuXG5cdCAgY29udGFpbmVyQW5pbWF0aW9uICYmIGNvbnRhaW5lckFuaW1hdGlvbi5zZWVrKHRpbWUpO1xuXHQgIHJldHVybiBjb250YWluZXJBbmltYXRpb24gPyB2YWx1ZSA6IE1hdGgucm91bmQodmFsdWUpO1xuXHR9LFxuXHQgICAgX3ByZWZpeEV4cCA9IC8oPzp3ZWJraXR8bW96fGxlbmd0aHxjc3NUZXh0fGluc2V0KS9pLFxuXHQgICAgX3JlcGFyZW50ID0gZnVuY3Rpb24gX3JlcGFyZW50KGVsZW1lbnQsIHBhcmVudCwgdG9wLCBsZWZ0KSB7XG5cdCAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSB7XG5cdCAgICB2YXIgc3R5bGUgPSBlbGVtZW50LnN0eWxlLFxuXHQgICAgICAgIHAsXG5cdCAgICAgICAgY3M7XG5cblx0ICAgIGlmIChwYXJlbnQgPT09IF9ib2R5KSB7XG5cdCAgICAgIGVsZW1lbnQuX3N0T3JpZyA9IHN0eWxlLmNzc1RleHQ7XG5cdCAgICAgIGNzID0gX2dldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG5cblx0ICAgICAgZm9yIChwIGluIGNzKSB7XG5cdCAgICAgICAgaWYgKCErcCAmJiAhX3ByZWZpeEV4cC50ZXN0KHApICYmIGNzW3BdICYmIHR5cGVvZiBzdHlsZVtwXSA9PT0gXCJzdHJpbmdcIiAmJiBwICE9PSBcIjBcIikge1xuXHQgICAgICAgICAgc3R5bGVbcF0gPSBjc1twXTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICBzdHlsZS50b3AgPSB0b3A7XG5cdCAgICAgIHN0eWxlLmxlZnQgPSBsZWZ0O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgc3R5bGUuY3NzVGV4dCA9IGVsZW1lbnQuX3N0T3JpZztcblx0ICAgIH1cblxuXHQgICAgZ3NhcC5jb3JlLmdldENhY2hlKGVsZW1lbnQpLnVuY2FjaGUgPSAxO1xuXHQgICAgcGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXHQgIH1cblx0fSxcblx0ICAgIF9nZXRUd2VlbkNyZWF0b3IgPSBmdW5jdGlvbiBfZ2V0VHdlZW5DcmVhdG9yKHNjcm9sbGVyLCBkaXJlY3Rpb24pIHtcblx0ICB2YXIgZ2V0U2Nyb2xsID0gX2dldFNjcm9sbEZ1bmMoc2Nyb2xsZXIsIGRpcmVjdGlvbiksXG5cdCAgICAgIHByb3AgPSBcIl9zY3JvbGxcIiArIGRpcmVjdGlvbi5wMixcblx0ICAgICAgbGFzdFNjcm9sbDEsXG5cdCAgICAgIGxhc3RTY3JvbGwyLFxuXHQgICAgICBnZXRUd2VlbiA9IGZ1bmN0aW9uIGdldFR3ZWVuKHNjcm9sbFRvLCB2YXJzLCBpbml0aWFsVmFsdWUsIGNoYW5nZTEsIGNoYW5nZTIpIHtcblx0ICAgIHZhciB0d2VlbiA9IGdldFR3ZWVuLnR3ZWVuLFxuXHQgICAgICAgIG9uQ29tcGxldGUgPSB2YXJzLm9uQ29tcGxldGUsXG5cdCAgICAgICAgbW9kaWZpZXJzID0ge307XG5cdCAgICB0d2VlbiAmJiB0d2Vlbi5raWxsKCk7XG5cdCAgICBsYXN0U2Nyb2xsMSA9IE1hdGgucm91bmQoaW5pdGlhbFZhbHVlKTtcblx0ICAgIHZhcnNbcHJvcF0gPSBzY3JvbGxUbztcblx0ICAgIHZhcnMubW9kaWZpZXJzID0gbW9kaWZpZXJzO1xuXG5cdCAgICBtb2RpZmllcnNbcHJvcF0gPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgICAgdmFsdWUgPSBfcm91bmQoZ2V0U2Nyb2xsKCkpO1xuXG5cdCAgICAgIGlmICh2YWx1ZSAhPT0gbGFzdFNjcm9sbDEgJiYgdmFsdWUgIT09IGxhc3RTY3JvbGwyICYmIE1hdGguYWJzKHZhbHVlIC0gbGFzdFNjcm9sbDEpID4gMiAmJiBNYXRoLmFicyh2YWx1ZSAtIGxhc3RTY3JvbGwyKSA+IDIpIHtcblx0ICAgICAgICB0d2Vlbi5raWxsKCk7XG5cdCAgICAgICAgZ2V0VHdlZW4udHdlZW4gPSAwO1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIHZhbHVlID0gaW5pdGlhbFZhbHVlICsgY2hhbmdlMSAqIHR3ZWVuLnJhdGlvICsgY2hhbmdlMiAqIHR3ZWVuLnJhdGlvICogdHdlZW4ucmF0aW87XG5cdCAgICAgIH1cblxuXHQgICAgICBsYXN0U2Nyb2xsMiA9IGxhc3RTY3JvbGwxO1xuXHQgICAgICByZXR1cm4gbGFzdFNjcm9sbDEgPSBfcm91bmQodmFsdWUpO1xuXHQgICAgfTtcblxuXHQgICAgdmFycy5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICBnZXRUd2Vlbi50d2VlbiA9IDA7XG5cdCAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZS5jYWxsKHR3ZWVuKTtcblx0ICAgIH07XG5cblx0ICAgIHR3ZWVuID0gZ2V0VHdlZW4udHdlZW4gPSBnc2FwLnRvKHNjcm9sbGVyLCB2YXJzKTtcblx0ICAgIHJldHVybiB0d2Vlbjtcblx0ICB9O1xuXG5cdCAgc2Nyb2xsZXJbcHJvcF0gPSBnZXRTY3JvbGw7XG5cblx0ICBfYWRkTGlzdGVuZXIoc2Nyb2xsZXIsIFwid2hlZWxcIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIGdldFR3ZWVuLnR3ZWVuICYmIGdldFR3ZWVuLnR3ZWVuLmtpbGwoKSAmJiAoZ2V0VHdlZW4udHdlZW4gPSAwKTtcblx0ICB9KTtcblxuXHQgIHJldHVybiBnZXRUd2Vlbjtcblx0fTtcblxuXHRfaG9yaXpvbnRhbC5vcCA9IF92ZXJ0aWNhbDtcblx0dmFyIFNjcm9sbFRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgZnVuY3Rpb24gU2Nyb2xsVHJpZ2dlcih2YXJzLCBhbmltYXRpb24pIHtcblx0ICAgIF9jb3JlSW5pdHRlZCB8fCBTY3JvbGxUcmlnZ2VyLnJlZ2lzdGVyKGdzYXApIHx8IGNvbnNvbGUud2FybihcIlBsZWFzZSBnc2FwLnJlZ2lzdGVyUGx1Z2luKFNjcm9sbFRyaWdnZXIpXCIpO1xuXHQgICAgdGhpcy5pbml0KHZhcnMsIGFuaW1hdGlvbik7XG5cdCAgfVxuXG5cdCAgdmFyIF9wcm90byA9IFNjcm9sbFRyaWdnZXIucHJvdG90eXBlO1xuXG5cdCAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KHZhcnMsIGFuaW1hdGlvbikge1xuXHQgICAgdGhpcy5wcm9ncmVzcyA9IHRoaXMuc3RhcnQgPSAwO1xuXHQgICAgdGhpcy52YXJzICYmIHRoaXMua2lsbCgxKTtcblxuXHQgICAgaWYgKCFfZW5hYmxlZCkge1xuXHQgICAgICB0aGlzLnVwZGF0ZSA9IHRoaXMucmVmcmVzaCA9IHRoaXMua2lsbCA9IF9wYXNzVGhyb3VnaDtcblx0ICAgICAgcmV0dXJuO1xuXHQgICAgfVxuXG5cdCAgICB2YXJzID0gX3NldERlZmF1bHRzKF9pc1N0cmluZyh2YXJzKSB8fCBfaXNOdW1iZXIodmFycykgfHwgdmFycy5ub2RlVHlwZSA/IHtcblx0ICAgICAgdHJpZ2dlcjogdmFyc1xuXHQgICAgfSA6IHZhcnMsIF9kZWZhdWx0cyk7XG5cblx0ICAgIHZhciBfdmFycyA9IHZhcnMsXG5cdCAgICAgICAgb25VcGRhdGUgPSBfdmFycy5vblVwZGF0ZSxcblx0ICAgICAgICB0b2dnbGVDbGFzcyA9IF92YXJzLnRvZ2dsZUNsYXNzLFxuXHQgICAgICAgIGlkID0gX3ZhcnMuaWQsXG5cdCAgICAgICAgb25Ub2dnbGUgPSBfdmFycy5vblRvZ2dsZSxcblx0ICAgICAgICBvblJlZnJlc2ggPSBfdmFycy5vblJlZnJlc2gsXG5cdCAgICAgICAgc2NydWIgPSBfdmFycy5zY3J1Yixcblx0ICAgICAgICB0cmlnZ2VyID0gX3ZhcnMudHJpZ2dlcixcblx0ICAgICAgICBwaW4gPSBfdmFycy5waW4sXG5cdCAgICAgICAgcGluU3BhY2luZyA9IF92YXJzLnBpblNwYWNpbmcsXG5cdCAgICAgICAgaW52YWxpZGF0ZU9uUmVmcmVzaCA9IF92YXJzLmludmFsaWRhdGVPblJlZnJlc2gsXG5cdCAgICAgICAgYW50aWNpcGF0ZVBpbiA9IF92YXJzLmFudGljaXBhdGVQaW4sXG5cdCAgICAgICAgb25TY3J1YkNvbXBsZXRlID0gX3ZhcnMub25TY3J1YkNvbXBsZXRlLFxuXHQgICAgICAgIG9uU25hcENvbXBsZXRlID0gX3ZhcnMub25TbmFwQ29tcGxldGUsXG5cdCAgICAgICAgb25jZSA9IF92YXJzLm9uY2UsXG5cdCAgICAgICAgc25hcCA9IF92YXJzLnNuYXAsXG5cdCAgICAgICAgcGluUmVwYXJlbnQgPSBfdmFycy5waW5SZXBhcmVudCxcblx0ICAgICAgICBwaW5TcGFjZXIgPSBfdmFycy5waW5TcGFjZXIsXG5cdCAgICAgICAgY29udGFpbmVyQW5pbWF0aW9uID0gX3ZhcnMuY29udGFpbmVyQW5pbWF0aW9uLFxuXHQgICAgICAgIGZhc3RTY3JvbGxFbmQgPSBfdmFycy5mYXN0U2Nyb2xsRW5kLFxuXHQgICAgICAgIHByZXZlbnRPdmVybGFwcyA9IF92YXJzLnByZXZlbnRPdmVybGFwcyxcblx0ICAgICAgICBkaXJlY3Rpb24gPSB2YXJzLmhvcml6b250YWwgfHwgdmFycy5jb250YWluZXJBbmltYXRpb24gJiYgdmFycy5ob3Jpem9udGFsICE9PSBmYWxzZSA/IF9ob3Jpem9udGFsIDogX3ZlcnRpY2FsLFxuXHQgICAgICAgIGlzVG9nZ2xlID0gIXNjcnViICYmIHNjcnViICE9PSAwLFxuXHQgICAgICAgIHNjcm9sbGVyID0gX2dldFRhcmdldCh2YXJzLnNjcm9sbGVyIHx8IF93aW4pLFxuXHQgICAgICAgIHNjcm9sbGVyQ2FjaGUgPSBnc2FwLmNvcmUuZ2V0Q2FjaGUoc2Nyb2xsZXIpLFxuXHQgICAgICAgIGlzVmlld3BvcnQgPSBfaXNWaWV3cG9ydChzY3JvbGxlciksXG5cdCAgICAgICAgdXNlRml4ZWRQb3NpdGlvbiA9IChcInBpblR5cGVcIiBpbiB2YXJzID8gdmFycy5waW5UeXBlIDogX2dldFByb3h5UHJvcChzY3JvbGxlciwgXCJwaW5UeXBlXCIpIHx8IGlzVmlld3BvcnQgJiYgXCJmaXhlZFwiKSA9PT0gXCJmaXhlZFwiLFxuXHQgICAgICAgIGNhbGxiYWNrcyA9IFt2YXJzLm9uRW50ZXIsIHZhcnMub25MZWF2ZSwgdmFycy5vbkVudGVyQmFjaywgdmFycy5vbkxlYXZlQmFja10sXG5cdCAgICAgICAgdG9nZ2xlQWN0aW9ucyA9IGlzVG9nZ2xlICYmIHZhcnMudG9nZ2xlQWN0aW9ucy5zcGxpdChcIiBcIiksXG5cdCAgICAgICAgbWFya2VycyA9IFwibWFya2Vyc1wiIGluIHZhcnMgPyB2YXJzLm1hcmtlcnMgOiBfZGVmYXVsdHMubWFya2Vycyxcblx0ICAgICAgICBib3JkZXJXaWR0aCA9IGlzVmlld3BvcnQgPyAwIDogcGFyc2VGbG9hdChfZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxlcilbXCJib3JkZXJcIiArIGRpcmVjdGlvbi5wMiArIF9XaWR0aF0pIHx8IDAsXG5cdCAgICAgICAgc2VsZiA9IHRoaXMsXG5cdCAgICAgICAgb25SZWZyZXNoSW5pdCA9IHZhcnMub25SZWZyZXNoSW5pdCAmJiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIHJldHVybiB2YXJzLm9uUmVmcmVzaEluaXQoc2VsZik7XG5cdCAgICB9LFxuXHQgICAgICAgIGdldFNjcm9sbGVyU2l6ZSA9IF9nZXRTaXplRnVuYyhzY3JvbGxlciwgaXNWaWV3cG9ydCwgZGlyZWN0aW9uKSxcblx0ICAgICAgICBnZXRTY3JvbGxlck9mZnNldHMgPSBfZ2V0T2Zmc2V0c0Z1bmMoc2Nyb2xsZXIsIGlzVmlld3BvcnQpLFxuXHQgICAgICAgIGxhc3RTbmFwID0gMCxcblx0ICAgICAgICBzY3JvbGxGdW5jID0gX2dldFNjcm9sbEZ1bmMoc2Nyb2xsZXIsIGRpcmVjdGlvbiksXG5cdCAgICAgICAgdHdlZW5Ubyxcblx0ICAgICAgICBwaW5DYWNoZSxcblx0ICAgICAgICBzbmFwRnVuYyxcblx0ICAgICAgICBzY3JvbGwxLFxuXHQgICAgICAgIHNjcm9sbDIsXG5cdCAgICAgICAgc3RhcnQsXG5cdCAgICAgICAgZW5kLFxuXHQgICAgICAgIG1hcmtlclN0YXJ0LFxuXHQgICAgICAgIG1hcmtlckVuZCxcblx0ICAgICAgICBtYXJrZXJTdGFydFRyaWdnZXIsXG5cdCAgICAgICAgbWFya2VyRW5kVHJpZ2dlcixcblx0ICAgICAgICBtYXJrZXJWYXJzLFxuXHQgICAgICAgIGNoYW5nZSxcblx0ICAgICAgICBwaW5PcmlnaW5hbFN0YXRlLFxuXHQgICAgICAgIHBpbkFjdGl2ZVN0YXRlLFxuXHQgICAgICAgIHBpblN0YXRlLFxuXHQgICAgICAgIHNwYWNlcixcblx0ICAgICAgICBvZmZzZXQsXG5cdCAgICAgICAgcGluR2V0dGVyLFxuXHQgICAgICAgIHBpblNldHRlcixcblx0ICAgICAgICBwaW5TdGFydCxcblx0ICAgICAgICBwaW5DaGFuZ2UsXG5cdCAgICAgICAgc3BhY2luZ1N0YXJ0LFxuXHQgICAgICAgIHNwYWNlclN0YXRlLFxuXHQgICAgICAgIG1hcmtlclN0YXJ0U2V0dGVyLFxuXHQgICAgICAgIG1hcmtlckVuZFNldHRlcixcblx0ICAgICAgICBjcyxcblx0ICAgICAgICBzbmFwMSxcblx0ICAgICAgICBzbmFwMixcblx0ICAgICAgICBzY3J1YlR3ZWVuLFxuXHQgICAgICAgIHNjcnViU21vb3RoLFxuXHQgICAgICAgIHNuYXBEdXJDbGFtcCxcblx0ICAgICAgICBzbmFwRGVsYXllZENhbGwsXG5cdCAgICAgICAgcHJldlByb2dyZXNzLFxuXHQgICAgICAgIHByZXZTY3JvbGwsXG5cdCAgICAgICAgcHJldkFuaW1Qcm9ncmVzcyxcblx0ICAgICAgICBjYU1hcmtlclNldHRlcjtcblxuXHQgICAgc2VsZi5tZWRpYSA9IF9jcmVhdGluZ01lZGlhO1xuXHQgICAgc2VsZi5fZGlyID0gZGlyZWN0aW9uO1xuXHQgICAgYW50aWNpcGF0ZVBpbiAqPSA0NTtcblx0ICAgIHNlbGYuc2Nyb2xsZXIgPSBzY3JvbGxlcjtcblx0ICAgIHNlbGYuc2Nyb2xsID0gY29udGFpbmVyQW5pbWF0aW9uID8gY29udGFpbmVyQW5pbWF0aW9uLnRpbWUuYmluZChjb250YWluZXJBbmltYXRpb24pIDogc2Nyb2xsRnVuYztcblx0ICAgIHNjcm9sbDEgPSBzY3JvbGxGdW5jKCk7XG5cdCAgICBzZWxmLnZhcnMgPSB2YXJzO1xuXHQgICAgYW5pbWF0aW9uID0gYW5pbWF0aW9uIHx8IHZhcnMuYW5pbWF0aW9uO1xuXHQgICAgXCJyZWZyZXNoUHJpb3JpdHlcIiBpbiB2YXJzICYmIChfc29ydCA9IDEpO1xuXHQgICAgc2Nyb2xsZXJDYWNoZS50d2VlblNjcm9sbCA9IHNjcm9sbGVyQ2FjaGUudHdlZW5TY3JvbGwgfHwge1xuXHQgICAgICB0b3A6IF9nZXRUd2VlbkNyZWF0b3Ioc2Nyb2xsZXIsIF92ZXJ0aWNhbCksXG5cdCAgICAgIGxlZnQ6IF9nZXRUd2VlbkNyZWF0b3Ioc2Nyb2xsZXIsIF9ob3Jpem9udGFsKVxuXHQgICAgfTtcblx0ICAgIHNlbGYudHdlZW5UbyA9IHR3ZWVuVG8gPSBzY3JvbGxlckNhY2hlLnR3ZWVuU2Nyb2xsW2RpcmVjdGlvbi5wXTtcblxuXHQgICAgaWYgKGFuaW1hdGlvbikge1xuXHQgICAgICBhbmltYXRpb24udmFycy5sYXp5ID0gZmFsc2U7XG5cdCAgICAgIGFuaW1hdGlvbi5faW5pdHRlZCB8fCBhbmltYXRpb24udmFycy5pbW1lZGlhdGVSZW5kZXIgIT09IGZhbHNlICYmIHZhcnMuaW1tZWRpYXRlUmVuZGVyICE9PSBmYWxzZSAmJiBhbmltYXRpb24ucmVuZGVyKDAsIHRydWUsIHRydWUpO1xuXHQgICAgICBzZWxmLmFuaW1hdGlvbiA9IGFuaW1hdGlvbi5wYXVzZSgpO1xuXHQgICAgICBhbmltYXRpb24uc2Nyb2xsVHJpZ2dlciA9IHNlbGY7XG5cdCAgICAgIHNjcnViU21vb3RoID0gX2lzTnVtYmVyKHNjcnViKSAmJiBzY3J1Yjtcblx0ICAgICAgc2NydWJTbW9vdGggJiYgKHNjcnViVHdlZW4gPSBnc2FwLnRvKGFuaW1hdGlvbiwge1xuXHQgICAgICAgIGVhc2U6IFwicG93ZXIzXCIsXG5cdCAgICAgICAgZHVyYXRpb246IHNjcnViU21vb3RoLFxuXHQgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uIG9uQ29tcGxldGUoKSB7XG5cdCAgICAgICAgICByZXR1cm4gb25TY3J1YkNvbXBsZXRlICYmIG9uU2NydWJDb21wbGV0ZShzZWxmKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH0pKTtcblx0ICAgICAgc25hcDEgPSAwO1xuXHQgICAgICBpZCB8fCAoaWQgPSBhbmltYXRpb24udmFycy5pZCk7XG5cdCAgICB9XG5cblx0ICAgIF90cmlnZ2Vycy5wdXNoKHNlbGYpO1xuXG5cdCAgICBpZiAoc25hcCkge1xuXHQgICAgICBpZiAoIV9pc09iamVjdChzbmFwKSB8fCBzbmFwLnB1c2gpIHtcblx0ICAgICAgICBzbmFwID0ge1xuXHQgICAgICAgICAgc25hcFRvOiBzbmFwXG5cdCAgICAgICAgfTtcblx0ICAgICAgfVxuXG5cdCAgICAgIFwic2Nyb2xsQmVoYXZpb3JcIiBpbiBfYm9keS5zdHlsZSAmJiBnc2FwLnNldChpc1ZpZXdwb3J0ID8gW19ib2R5LCBfZG9jRWxdIDogc2Nyb2xsZXIsIHtcblx0ICAgICAgICBzY3JvbGxCZWhhdmlvcjogXCJhdXRvXCJcblx0ICAgICAgfSk7XG5cdCAgICAgIHNuYXBGdW5jID0gX2lzRnVuY3Rpb24oc25hcC5zbmFwVG8pID8gc25hcC5zbmFwVG8gOiBzbmFwLnNuYXBUbyA9PT0gXCJsYWJlbHNcIiA/IF9nZXRDbG9zZXN0TGFiZWwoYW5pbWF0aW9uKSA6IHNuYXAuc25hcFRvID09PSBcImxhYmVsc0RpcmVjdGlvbmFsXCIgPyBfZ2V0TGFiZWxBdERpcmVjdGlvbihhbmltYXRpb24pIDogc25hcC5kaXJlY3Rpb25hbCAhPT0gZmFsc2UgPyBmdW5jdGlvbiAodmFsdWUsIHN0KSB7XG5cdCAgICAgICAgcmV0dXJuIF9zbmFwRGlyZWN0aW9uYWwoc25hcC5zbmFwVG8pKHZhbHVlLCBzdC5kaXJlY3Rpb24pO1xuXHQgICAgICB9IDogZ3NhcC51dGlscy5zbmFwKHNuYXAuc25hcFRvKTtcblx0ICAgICAgc25hcER1ckNsYW1wID0gc25hcC5kdXJhdGlvbiB8fCB7XG5cdCAgICAgICAgbWluOiAwLjEsXG5cdCAgICAgICAgbWF4OiAyXG5cdCAgICAgIH07XG5cdCAgICAgIHNuYXBEdXJDbGFtcCA9IF9pc09iamVjdChzbmFwRHVyQ2xhbXApID8gX2NsYW1wKHNuYXBEdXJDbGFtcC5taW4sIHNuYXBEdXJDbGFtcC5tYXgpIDogX2NsYW1wKHNuYXBEdXJDbGFtcCwgc25hcER1ckNsYW1wKTtcblx0ICAgICAgc25hcERlbGF5ZWRDYWxsID0gZ3NhcC5kZWxheWVkQ2FsbChzbmFwLmRlbGF5IHx8IHNjcnViU21vb3RoIC8gMiB8fCAwLjEsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBpZiAoTWF0aC5hYnMoc2VsZi5nZXRWZWxvY2l0eSgpKSA8IDEwICYmICFfcG9pbnRlcklzRG93biAmJiBsYXN0U25hcCAhPT0gc2Nyb2xsRnVuYygpKSB7XG5cdCAgICAgICAgICB2YXIgdG90YWxQcm9ncmVzcyA9IGFuaW1hdGlvbiAmJiAhaXNUb2dnbGUgPyBhbmltYXRpb24udG90YWxQcm9ncmVzcygpIDogc2VsZi5wcm9ncmVzcyxcblx0ICAgICAgICAgICAgICB2ZWxvY2l0eSA9ICh0b3RhbFByb2dyZXNzIC0gc25hcDIpIC8gKF9nZXRUaW1lKCkgLSBfdGltZTIpICogMTAwMCB8fCAwLFxuXHQgICAgICAgICAgICAgIGNoYW5nZTEgPSBnc2FwLnV0aWxzLmNsYW1wKC1zZWxmLnByb2dyZXNzLCAxIC0gc2VsZi5wcm9ncmVzcywgX2Ficyh2ZWxvY2l0eSAvIDIpICogdmVsb2NpdHkgLyAwLjE4NSksXG5cdCAgICAgICAgICAgICAgbmF0dXJhbEVuZCA9IHNlbGYucHJvZ3Jlc3MgKyAoc25hcC5pbmVydGlhID09PSBmYWxzZSA/IDAgOiBjaGFuZ2UxKSxcblx0ICAgICAgICAgICAgICBlbmRWYWx1ZSA9IF9jbGFtcCgwLCAxLCBzbmFwRnVuYyhuYXR1cmFsRW5kLCBzZWxmKSksXG5cdCAgICAgICAgICAgICAgc2Nyb2xsID0gc2Nyb2xsRnVuYygpLFxuXHQgICAgICAgICAgICAgIGVuZFNjcm9sbCA9IE1hdGgucm91bmQoc3RhcnQgKyBlbmRWYWx1ZSAqIGNoYW5nZSksXG5cdCAgICAgICAgICAgICAgX3NuYXAgPSBzbmFwLFxuXHQgICAgICAgICAgICAgIG9uU3RhcnQgPSBfc25hcC5vblN0YXJ0LFxuXHQgICAgICAgICAgICAgIF9vbkludGVycnVwdCA9IF9zbmFwLm9uSW50ZXJydXB0LFxuXHQgICAgICAgICAgICAgIF9vbkNvbXBsZXRlID0gX3NuYXAub25Db21wbGV0ZSxcblx0ICAgICAgICAgICAgICB0d2VlbiA9IHR3ZWVuVG8udHdlZW47XG5cblx0ICAgICAgICAgIGlmIChzY3JvbGwgPD0gZW5kICYmIHNjcm9sbCA+PSBzdGFydCAmJiBlbmRTY3JvbGwgIT09IHNjcm9sbCkge1xuXHQgICAgICAgICAgICBpZiAodHdlZW4gJiYgIXR3ZWVuLl9pbml0dGVkICYmIHR3ZWVuLmRhdGEgPD0gX2FicyhlbmRTY3JvbGwgLSBzY3JvbGwpKSB7XG5cdCAgICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgaWYgKHNuYXAuaW5lcnRpYSA9PT0gZmFsc2UpIHtcblx0ICAgICAgICAgICAgICBjaGFuZ2UxID0gZW5kVmFsdWUgLSBzZWxmLnByb2dyZXNzO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgdHdlZW5UbyhlbmRTY3JvbGwsIHtcblx0ICAgICAgICAgICAgICBkdXJhdGlvbjogc25hcER1ckNsYW1wKF9hYnMoTWF0aC5tYXgoX2FicyhuYXR1cmFsRW5kIC0gdG90YWxQcm9ncmVzcyksIF9hYnMoZW5kVmFsdWUgLSB0b3RhbFByb2dyZXNzKSkgKiAwLjE4NSAvIHZlbG9jaXR5IC8gMC4wNSB8fCAwKSksXG5cdCAgICAgICAgICAgICAgZWFzZTogc25hcC5lYXNlIHx8IFwicG93ZXIzXCIsXG5cdCAgICAgICAgICAgICAgZGF0YTogX2FicyhlbmRTY3JvbGwgLSBzY3JvbGwpLFxuXHQgICAgICAgICAgICAgIG9uSW50ZXJydXB0OiBmdW5jdGlvbiBvbkludGVycnVwdCgpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBzbmFwRGVsYXllZENhbGwucmVzdGFydCh0cnVlKSAmJiBfb25JbnRlcnJ1cHQgJiYgX29uSW50ZXJydXB0KHNlbGYpO1xuXHQgICAgICAgICAgICAgIH0sXG5cdCAgICAgICAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gb25Db21wbGV0ZSgpIHtcblx0ICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKCk7XG5cdCAgICAgICAgICAgICAgICBsYXN0U25hcCA9IHNjcm9sbEZ1bmMoKTtcblx0ICAgICAgICAgICAgICAgIHNuYXAxID0gc25hcDIgPSBhbmltYXRpb24gJiYgIWlzVG9nZ2xlID8gYW5pbWF0aW9uLnRvdGFsUHJvZ3Jlc3MoKSA6IHNlbGYucHJvZ3Jlc3M7XG5cdCAgICAgICAgICAgICAgICBvblNuYXBDb21wbGV0ZSAmJiBvblNuYXBDb21wbGV0ZShzZWxmKTtcblx0ICAgICAgICAgICAgICAgIF9vbkNvbXBsZXRlICYmIF9vbkNvbXBsZXRlKHNlbGYpO1xuXHQgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSwgc2Nyb2xsLCBjaGFuZ2UxICogY2hhbmdlLCBlbmRTY3JvbGwgLSBzY3JvbGwgLSBjaGFuZ2UxICogY2hhbmdlKTtcblx0ICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KHNlbGYsIHR3ZWVuVG8udHdlZW4pO1xuXHQgICAgICAgICAgfVxuXHQgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5pc0FjdGl2ZSkge1xuXHQgICAgICAgICAgc25hcERlbGF5ZWRDYWxsLnJlc3RhcnQodHJ1ZSk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9KS5wYXVzZSgpO1xuXHQgICAgfVxuXG5cdCAgICBpZCAmJiAoX2lkc1tpZF0gPSBzZWxmKTtcblx0ICAgIHRyaWdnZXIgPSBzZWxmLnRyaWdnZXIgPSBfZ2V0VGFyZ2V0KHRyaWdnZXIgfHwgcGluKTtcblx0ICAgIHBpbiA9IHBpbiA9PT0gdHJ1ZSA/IHRyaWdnZXIgOiBfZ2V0VGFyZ2V0KHBpbik7XG5cdCAgICBfaXNTdHJpbmcodG9nZ2xlQ2xhc3MpICYmICh0b2dnbGVDbGFzcyA9IHtcblx0ICAgICAgdGFyZ2V0czogdHJpZ2dlcixcblx0ICAgICAgY2xhc3NOYW1lOiB0b2dnbGVDbGFzc1xuXHQgICAgfSk7XG5cblx0ICAgIGlmIChwaW4pIHtcblx0ICAgICAgcGluU3BhY2luZyA9PT0gZmFsc2UgfHwgcGluU3BhY2luZyA9PT0gX21hcmdpbiB8fCAocGluU3BhY2luZyA9ICFwaW5TcGFjaW5nICYmIF9nZXRDb21wdXRlZFN0eWxlKHBpbi5wYXJlbnROb2RlKS5kaXNwbGF5ID09PSBcImZsZXhcIiA/IGZhbHNlIDogX3BhZGRpbmcpO1xuXHQgICAgICBzZWxmLnBpbiA9IHBpbjtcblx0ICAgICAgdmFycy5mb3JjZTNEICE9PSBmYWxzZSAmJiBnc2FwLnNldChwaW4sIHtcblx0ICAgICAgICBmb3JjZTNEOiB0cnVlXG5cdCAgICAgIH0pO1xuXHQgICAgICBwaW5DYWNoZSA9IGdzYXAuY29yZS5nZXRDYWNoZShwaW4pO1xuXG5cdCAgICAgIGlmICghcGluQ2FjaGUuc3BhY2VyKSB7XG5cdCAgICAgICAgaWYgKHBpblNwYWNlcikge1xuXHQgICAgICAgICAgcGluU3BhY2VyID0gX2dldFRhcmdldChwaW5TcGFjZXIpO1xuXHQgICAgICAgICAgcGluU3BhY2VyICYmICFwaW5TcGFjZXIubm9kZVR5cGUgJiYgKHBpblNwYWNlciA9IHBpblNwYWNlci5jdXJyZW50IHx8IHBpblNwYWNlci5uYXRpdmVFbGVtZW50KTtcblx0ICAgICAgICAgIHBpbkNhY2hlLnNwYWNlcklzTmF0aXZlID0gISFwaW5TcGFjZXI7XG5cdCAgICAgICAgICBwaW5TcGFjZXIgJiYgKHBpbkNhY2hlLnNwYWNlclN0YXRlID0gX2dldFN0YXRlKHBpblNwYWNlcikpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHBpbkNhY2hlLnNwYWNlciA9IHNwYWNlciA9IHBpblNwYWNlciB8fCBfZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdCAgICAgICAgc3BhY2VyLmNsYXNzTGlzdC5hZGQoXCJwaW4tc3BhY2VyXCIpO1xuXHQgICAgICAgIGlkICYmIHNwYWNlci5jbGFzc0xpc3QuYWRkKFwicGluLXNwYWNlci1cIiArIGlkKTtcblx0ICAgICAgICBwaW5DYWNoZS5waW5TdGF0ZSA9IHBpbk9yaWdpbmFsU3RhdGUgPSBfZ2V0U3RhdGUocGluKTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBwaW5PcmlnaW5hbFN0YXRlID0gcGluQ2FjaGUucGluU3RhdGU7XG5cdCAgICAgIH1cblxuXHQgICAgICBzZWxmLnNwYWNlciA9IHNwYWNlciA9IHBpbkNhY2hlLnNwYWNlcjtcblx0ICAgICAgY3MgPSBfZ2V0Q29tcHV0ZWRTdHlsZShwaW4pO1xuXHQgICAgICBzcGFjaW5nU3RhcnQgPSBjc1twaW5TcGFjaW5nICsgZGlyZWN0aW9uLm9zMl07XG5cdCAgICAgIHBpbkdldHRlciA9IGdzYXAuZ2V0UHJvcGVydHkocGluKTtcblx0ICAgICAgcGluU2V0dGVyID0gZ3NhcC5xdWlja1NldHRlcihwaW4sIGRpcmVjdGlvbi5hLCBfcHgpO1xuXG5cdCAgICAgIF9zd2FwUGluSW4ocGluLCBzcGFjZXIsIGNzKTtcblxuXHQgICAgICBwaW5TdGF0ZSA9IF9nZXRTdGF0ZShwaW4pO1xuXHQgICAgfVxuXG5cdCAgICBpZiAobWFya2Vycykge1xuXHQgICAgICBtYXJrZXJWYXJzID0gX2lzT2JqZWN0KG1hcmtlcnMpID8gX3NldERlZmF1bHRzKG1hcmtlcnMsIF9tYXJrZXJEZWZhdWx0cykgOiBfbWFya2VyRGVmYXVsdHM7XG5cdCAgICAgIG1hcmtlclN0YXJ0VHJpZ2dlciA9IF9jcmVhdGVNYXJrZXIoXCJzY3JvbGxlci1zdGFydFwiLCBpZCwgc2Nyb2xsZXIsIGRpcmVjdGlvbiwgbWFya2VyVmFycywgMCk7XG5cdCAgICAgIG1hcmtlckVuZFRyaWdnZXIgPSBfY3JlYXRlTWFya2VyKFwic2Nyb2xsZXItZW5kXCIsIGlkLCBzY3JvbGxlciwgZGlyZWN0aW9uLCBtYXJrZXJWYXJzLCAwLCBtYXJrZXJTdGFydFRyaWdnZXIpO1xuXHQgICAgICBvZmZzZXQgPSBtYXJrZXJTdGFydFRyaWdnZXJbXCJvZmZzZXRcIiArIGRpcmVjdGlvbi5vcC5kMl07XG5cdCAgICAgIG1hcmtlclN0YXJ0ID0gX2NyZWF0ZU1hcmtlcihcInN0YXJ0XCIsIGlkLCBzY3JvbGxlciwgZGlyZWN0aW9uLCBtYXJrZXJWYXJzLCBvZmZzZXQsIDAsIGNvbnRhaW5lckFuaW1hdGlvbik7XG5cdCAgICAgIG1hcmtlckVuZCA9IF9jcmVhdGVNYXJrZXIoXCJlbmRcIiwgaWQsIHNjcm9sbGVyLCBkaXJlY3Rpb24sIG1hcmtlclZhcnMsIG9mZnNldCwgMCwgY29udGFpbmVyQW5pbWF0aW9uKTtcblx0ICAgICAgY29udGFpbmVyQW5pbWF0aW9uICYmIChjYU1hcmtlclNldHRlciA9IGdzYXAucXVpY2tTZXR0ZXIoW21hcmtlclN0YXJ0LCBtYXJrZXJFbmRdLCBkaXJlY3Rpb24uYSwgX3B4KSk7XG5cblx0ICAgICAgaWYgKCF1c2VGaXhlZFBvc2l0aW9uICYmICEoX3Byb3hpZXMubGVuZ3RoICYmIF9nZXRQcm94eVByb3Aoc2Nyb2xsZXIsIFwiZml4ZWRNYXJrZXJzXCIpID09PSB0cnVlKSkge1xuXHQgICAgICAgIF9tYWtlUG9zaXRpb25hYmxlKGlzVmlld3BvcnQgPyBfYm9keSA6IHNjcm9sbGVyKTtcblxuXHQgICAgICAgIGdzYXAuc2V0KFttYXJrZXJTdGFydFRyaWdnZXIsIG1hcmtlckVuZFRyaWdnZXJdLCB7XG5cdCAgICAgICAgICBmb3JjZTNEOiB0cnVlXG5cdCAgICAgICAgfSk7XG5cdCAgICAgICAgbWFya2VyU3RhcnRTZXR0ZXIgPSBnc2FwLnF1aWNrU2V0dGVyKG1hcmtlclN0YXJ0VHJpZ2dlciwgZGlyZWN0aW9uLmEsIF9weCk7XG5cdCAgICAgICAgbWFya2VyRW5kU2V0dGVyID0gZ3NhcC5xdWlja1NldHRlcihtYXJrZXJFbmRUcmlnZ2VyLCBkaXJlY3Rpb24uYSwgX3B4KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICBpZiAoY29udGFpbmVyQW5pbWF0aW9uKSB7XG5cdCAgICAgIHZhciBvbGRPblVwZGF0ZSA9IGNvbnRhaW5lckFuaW1hdGlvbi52YXJzLm9uVXBkYXRlLFxuXHQgICAgICAgICAgb2xkUGFyYW1zID0gY29udGFpbmVyQW5pbWF0aW9uLnZhcnMub25VcGRhdGVQYXJhbXM7XG5cdCAgICAgIGNvbnRhaW5lckFuaW1hdGlvbi5ldmVudENhbGxiYWNrKFwib25VcGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIHNlbGYudXBkYXRlKDAsIDAsIDEpO1xuXHQgICAgICAgIG9sZE9uVXBkYXRlICYmIG9sZE9uVXBkYXRlLmFwcGx5KG9sZFBhcmFtcyB8fCBbXSk7XG5cdCAgICAgIH0pO1xuXHQgICAgfVxuXG5cdCAgICBzZWxmLnByZXZpb3VzID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gX3RyaWdnZXJzW190cmlnZ2Vycy5pbmRleE9mKHNlbGYpIC0gMV07XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLm5leHQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIHJldHVybiBfdHJpZ2dlcnNbX3RyaWdnZXJzLmluZGV4T2Yoc2VsZikgKyAxXTtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYucmV2ZXJ0ID0gZnVuY3Rpb24gKHJldmVydCkge1xuXHQgICAgICB2YXIgciA9IHJldmVydCAhPT0gZmFsc2UgfHwgIXNlbGYuZW5hYmxlZCxcblx0ICAgICAgICAgIHByZXZSZWZyZXNoaW5nID0gX3JlZnJlc2hpbmc7XG5cblx0ICAgICAgaWYgKHIgIT09IHNlbGYuaXNSZXZlcnRlZCkge1xuXHQgICAgICAgIGlmIChyKSB7XG5cdCAgICAgICAgICBzZWxmLnNjcm9sbC5yZWMgfHwgKHNlbGYuc2Nyb2xsLnJlYyA9IHNjcm9sbEZ1bmMoKSk7XG5cdCAgICAgICAgICBwcmV2U2Nyb2xsID0gTWF0aC5tYXgoc2Nyb2xsRnVuYygpLCBzZWxmLnNjcm9sbC5yZWMgfHwgMCk7XG5cdCAgICAgICAgICBwcmV2UHJvZ3Jlc3MgPSBzZWxmLnByb2dyZXNzO1xuXHQgICAgICAgICAgcHJldkFuaW1Qcm9ncmVzcyA9IGFuaW1hdGlvbiAmJiBhbmltYXRpb24ucHJvZ3Jlc3MoKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBtYXJrZXJTdGFydCAmJiBbbWFya2VyU3RhcnQsIG1hcmtlckVuZCwgbWFya2VyU3RhcnRUcmlnZ2VyLCBtYXJrZXJFbmRUcmlnZ2VyXS5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG5cdCAgICAgICAgICByZXR1cm4gbS5zdHlsZS5kaXNwbGF5ID0gciA/IFwibm9uZVwiIDogXCJibG9ja1wiO1xuXHQgICAgICAgIH0pO1xuXHQgICAgICAgIHIgJiYgKF9yZWZyZXNoaW5nID0gMSk7XG5cdCAgICAgICAgc2VsZi51cGRhdGUocik7XG5cdCAgICAgICAgX3JlZnJlc2hpbmcgPSBwcmV2UmVmcmVzaGluZztcblx0ICAgICAgICBwaW4gJiYgKHIgPyBfc3dhcFBpbk91dChwaW4sIHNwYWNlciwgcGluT3JpZ2luYWxTdGF0ZSkgOiAoIXBpblJlcGFyZW50IHx8ICFzZWxmLmlzQWN0aXZlKSAmJiBfc3dhcFBpbkluKHBpbiwgc3BhY2VyLCBfZ2V0Q29tcHV0ZWRTdHlsZShwaW4pLCBzcGFjZXJTdGF0ZSkpO1xuXHQgICAgICAgIHNlbGYuaXNSZXZlcnRlZCA9IHI7XG5cdCAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIHNlbGYucmVmcmVzaCA9IGZ1bmN0aW9uIChzb2Z0LCBmb3JjZSkge1xuXHQgICAgICBpZiAoKF9yZWZyZXNoaW5nIHx8ICFzZWxmLmVuYWJsZWQpICYmICFmb3JjZSkge1xuXHQgICAgICAgIHJldHVybjtcblx0ICAgICAgfVxuXG5cdCAgICAgIGlmIChwaW4gJiYgc29mdCAmJiBfbGFzdFNjcm9sbFRpbWUpIHtcblx0ICAgICAgICBfYWRkTGlzdGVuZXIoU2Nyb2xsVHJpZ2dlciwgXCJzY3JvbGxFbmRcIiwgX3NvZnRSZWZyZXNoKTtcblxuXHQgICAgICAgIHJldHVybjtcblx0ICAgICAgfVxuXG5cdCAgICAgIF9yZWZyZXNoaW5nID0gMTtcblx0ICAgICAgc2NydWJUd2VlbiAmJiBzY3J1YlR3ZWVuLnBhdXNlKCk7XG5cdCAgICAgIGludmFsaWRhdGVPblJlZnJlc2ggJiYgYW5pbWF0aW9uICYmIGFuaW1hdGlvbi50aW1lKC0wLjAxLCB0cnVlKS5pbnZhbGlkYXRlKCk7XG5cdCAgICAgIHNlbGYuaXNSZXZlcnRlZCB8fCBzZWxmLnJldmVydCgpO1xuXG5cdCAgICAgIHZhciBzaXplID0gZ2V0U2Nyb2xsZXJTaXplKCksXG5cdCAgICAgICAgICBzY3JvbGxlckJvdW5kcyA9IGdldFNjcm9sbGVyT2Zmc2V0cygpLFxuXHQgICAgICAgICAgbWF4ID0gY29udGFpbmVyQW5pbWF0aW9uID8gY29udGFpbmVyQW5pbWF0aW9uLmR1cmF0aW9uKCkgOiBfbWF4U2Nyb2xsKHNjcm9sbGVyLCBkaXJlY3Rpb24pLFxuXHQgICAgICAgICAgb2Zmc2V0ID0gMCxcblx0ICAgICAgICAgIG90aGVyUGluT2Zmc2V0ID0gMCxcblx0ICAgICAgICAgIHBhcnNlZEVuZCA9IHZhcnMuZW5kLFxuXHQgICAgICAgICAgcGFyc2VkRW5kVHJpZ2dlciA9IHZhcnMuZW5kVHJpZ2dlciB8fCB0cmlnZ2VyLFxuXHQgICAgICAgICAgcGFyc2VkU3RhcnQgPSB2YXJzLnN0YXJ0IHx8ICh2YXJzLnN0YXJ0ID09PSAwIHx8ICF0cmlnZ2VyID8gMCA6IHBpbiA/IFwiMCAwXCIgOiBcIjAgMTAwJVwiKSxcblx0ICAgICAgICAgIHBpbm5lZENvbnRhaW5lciA9IHZhcnMucGlubmVkQ29udGFpbmVyICYmIF9nZXRUYXJnZXQodmFycy5waW5uZWRDb250YWluZXIpLFxuXHQgICAgICAgICAgdHJpZ2dlckluZGV4ID0gdHJpZ2dlciAmJiBNYXRoLm1heCgwLCBfdHJpZ2dlcnMuaW5kZXhPZihzZWxmKSkgfHwgMCxcblx0ICAgICAgICAgIGkgPSB0cmlnZ2VySW5kZXgsXG5cdCAgICAgICAgICBjcyxcblx0ICAgICAgICAgIGJvdW5kcyxcblx0ICAgICAgICAgIHNjcm9sbCxcblx0ICAgICAgICAgIGlzVmVydGljYWwsXG5cdCAgICAgICAgICBvdmVycmlkZSxcblx0ICAgICAgICAgIGN1clRyaWdnZXIsXG5cdCAgICAgICAgICBjdXJQaW4sXG5cdCAgICAgICAgICBvcHBvc2l0ZVNjcm9sbCxcblx0ICAgICAgICAgIGluaXR0ZWQsXG5cdCAgICAgICAgICByZXZlcnRlZFBpbnM7XG5cblx0ICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgIGN1clRyaWdnZXIgPSBfdHJpZ2dlcnNbaV07XG5cdCAgICAgICAgY3VyVHJpZ2dlci5lbmQgfHwgY3VyVHJpZ2dlci5yZWZyZXNoKDAsIDEpIHx8IChfcmVmcmVzaGluZyA9IDEpO1xuXHQgICAgICAgIGN1clBpbiA9IGN1clRyaWdnZXIucGluO1xuXG5cdCAgICAgICAgaWYgKGN1clBpbiAmJiAoY3VyUGluID09PSB0cmlnZ2VyIHx8IGN1clBpbiA9PT0gcGluKSAmJiAhY3VyVHJpZ2dlci5pc1JldmVydGVkKSB7XG5cdCAgICAgICAgICByZXZlcnRlZFBpbnMgfHwgKHJldmVydGVkUGlucyA9IFtdKTtcblx0ICAgICAgICAgIHJldmVydGVkUGlucy51bnNoaWZ0KGN1clRyaWdnZXIpO1xuXHQgICAgICAgICAgY3VyVHJpZ2dlci5yZXZlcnQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICBfaXNGdW5jdGlvbihwYXJzZWRTdGFydCkgJiYgKHBhcnNlZFN0YXJ0ID0gcGFyc2VkU3RhcnQoc2VsZikpO1xuXHQgICAgICBzdGFydCA9IF9wYXJzZVBvc2l0aW9uKHBhcnNlZFN0YXJ0LCB0cmlnZ2VyLCBzaXplLCBkaXJlY3Rpb24sIHNjcm9sbEZ1bmMoKSwgbWFya2VyU3RhcnQsIG1hcmtlclN0YXJ0VHJpZ2dlciwgc2VsZiwgc2Nyb2xsZXJCb3VuZHMsIGJvcmRlcldpZHRoLCB1c2VGaXhlZFBvc2l0aW9uLCBtYXgsIGNvbnRhaW5lckFuaW1hdGlvbikgfHwgKHBpbiA/IC0wLjAwMSA6IDApO1xuXHQgICAgICBfaXNGdW5jdGlvbihwYXJzZWRFbmQpICYmIChwYXJzZWRFbmQgPSBwYXJzZWRFbmQoc2VsZikpO1xuXG5cdCAgICAgIGlmIChfaXNTdHJpbmcocGFyc2VkRW5kKSAmJiAhcGFyc2VkRW5kLmluZGV4T2YoXCIrPVwiKSkge1xuXHQgICAgICAgIGlmICh+cGFyc2VkRW5kLmluZGV4T2YoXCIgXCIpKSB7XG5cdCAgICAgICAgICBwYXJzZWRFbmQgPSAoX2lzU3RyaW5nKHBhcnNlZFN0YXJ0KSA/IHBhcnNlZFN0YXJ0LnNwbGl0KFwiIFwiKVswXSA6IFwiXCIpICsgcGFyc2VkRW5kO1xuXHQgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICBvZmZzZXQgPSBfb2Zmc2V0VG9QeChwYXJzZWRFbmQuc3Vic3RyKDIpLCBzaXplKTtcblx0ICAgICAgICAgIHBhcnNlZEVuZCA9IF9pc1N0cmluZyhwYXJzZWRTdGFydCkgPyBwYXJzZWRTdGFydCA6IHN0YXJ0ICsgb2Zmc2V0O1xuXHQgICAgICAgICAgcGFyc2VkRW5kVHJpZ2dlciA9IHRyaWdnZXI7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgZW5kID0gTWF0aC5tYXgoc3RhcnQsIF9wYXJzZVBvc2l0aW9uKHBhcnNlZEVuZCB8fCAocGFyc2VkRW5kVHJpZ2dlciA/IFwiMTAwJSAwXCIgOiBtYXgpLCBwYXJzZWRFbmRUcmlnZ2VyLCBzaXplLCBkaXJlY3Rpb24sIHNjcm9sbEZ1bmMoKSArIG9mZnNldCwgbWFya2VyRW5kLCBtYXJrZXJFbmRUcmlnZ2VyLCBzZWxmLCBzY3JvbGxlckJvdW5kcywgYm9yZGVyV2lkdGgsIHVzZUZpeGVkUG9zaXRpb24sIG1heCwgY29udGFpbmVyQW5pbWF0aW9uKSkgfHwgLTAuMDAxO1xuXHQgICAgICBjaGFuZ2UgPSBlbmQgLSBzdGFydCB8fCAoc3RhcnQgLT0gMC4wMSkgJiYgMC4wMDE7XG5cdCAgICAgIG9mZnNldCA9IDA7XG5cdCAgICAgIGkgPSB0cmlnZ2VySW5kZXg7XG5cblx0ICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgIGN1clRyaWdnZXIgPSBfdHJpZ2dlcnNbaV07XG5cdCAgICAgICAgY3VyUGluID0gY3VyVHJpZ2dlci5waW47XG5cblx0ICAgICAgICBpZiAoY3VyUGluICYmIGN1clRyaWdnZXIuc3RhcnQgLSBjdXJUcmlnZ2VyLl9waW5QdXNoIDwgc3RhcnQgJiYgIWNvbnRhaW5lckFuaW1hdGlvbikge1xuXHQgICAgICAgICAgY3MgPSBjdXJUcmlnZ2VyLmVuZCAtIGN1clRyaWdnZXIuc3RhcnQ7XG5cblx0ICAgICAgICAgIGlmICgoY3VyUGluID09PSB0cmlnZ2VyIHx8IGN1clBpbiA9PT0gcGlubmVkQ29udGFpbmVyKSAmJiAhX2lzTnVtYmVyKHBhcnNlZFN0YXJ0KSkge1xuXHQgICAgICAgICAgICBvZmZzZXQgKz0gY3MgKiAoMSAtIGN1clRyaWdnZXIucHJvZ3Jlc3MpO1xuXHQgICAgICAgICAgfVxuXG5cdCAgICAgICAgICBjdXJQaW4gPT09IHBpbiAmJiAob3RoZXJQaW5PZmZzZXQgKz0gY3MpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXG5cdCAgICAgIHN0YXJ0ICs9IG9mZnNldDtcblx0ICAgICAgZW5kICs9IG9mZnNldDtcblx0ICAgICAgc2VsZi5fcGluUHVzaCA9IG90aGVyUGluT2Zmc2V0O1xuXG5cdCAgICAgIGlmIChtYXJrZXJTdGFydCAmJiBvZmZzZXQpIHtcblx0ICAgICAgICBjcyA9IHt9O1xuXHQgICAgICAgIGNzW2RpcmVjdGlvbi5hXSA9IFwiKz1cIiArIG9mZnNldDtcblx0ICAgICAgICBwaW5uZWRDb250YWluZXIgJiYgKGNzW2RpcmVjdGlvbi5wXSA9IFwiLT1cIiArIHNjcm9sbEZ1bmMoKSk7XG5cdCAgICAgICAgZ3NhcC5zZXQoW21hcmtlclN0YXJ0LCBtYXJrZXJFbmRdLCBjcyk7XG5cdCAgICAgIH1cblxuXHQgICAgICBpZiAocGluKSB7XG5cdCAgICAgICAgY3MgPSBfZ2V0Q29tcHV0ZWRTdHlsZShwaW4pO1xuXHQgICAgICAgIGlzVmVydGljYWwgPSBkaXJlY3Rpb24gPT09IF92ZXJ0aWNhbDtcblx0ICAgICAgICBzY3JvbGwgPSBzY3JvbGxGdW5jKCk7XG5cdCAgICAgICAgcGluU3RhcnQgPSBwYXJzZUZsb2F0KHBpbkdldHRlcihkaXJlY3Rpb24uYSkpICsgb3RoZXJQaW5PZmZzZXQ7XG5cdCAgICAgICAgIW1heCAmJiBlbmQgPiAxICYmICgoaXNWaWV3cG9ydCA/IF9ib2R5IDogc2Nyb2xsZXIpLnN0eWxlW1wib3ZlcmZsb3ctXCIgKyBkaXJlY3Rpb24uYV0gPSBcInNjcm9sbFwiKTtcblxuXHQgICAgICAgIF9zd2FwUGluSW4ocGluLCBzcGFjZXIsIGNzKTtcblxuXHQgICAgICAgIHBpblN0YXRlID0gX2dldFN0YXRlKHBpbik7XG5cdCAgICAgICAgYm91bmRzID0gX2dldEJvdW5kcyhwaW4sIHRydWUpO1xuXHQgICAgICAgIG9wcG9zaXRlU2Nyb2xsID0gdXNlRml4ZWRQb3NpdGlvbiAmJiBfZ2V0U2Nyb2xsRnVuYyhzY3JvbGxlciwgaXNWZXJ0aWNhbCA/IF9ob3Jpem9udGFsIDogX3ZlcnRpY2FsKSgpO1xuXG5cdCAgICAgICAgaWYgKHBpblNwYWNpbmcpIHtcblx0ICAgICAgICAgIHNwYWNlclN0YXRlID0gW3BpblNwYWNpbmcgKyBkaXJlY3Rpb24ub3MyLCBjaGFuZ2UgKyBvdGhlclBpbk9mZnNldCArIF9weF07XG5cdCAgICAgICAgICBzcGFjZXJTdGF0ZS50ID0gc3BhY2VyO1xuXHQgICAgICAgICAgaSA9IHBpblNwYWNpbmcgPT09IF9wYWRkaW5nID8gX2dldFNpemUocGluLCBkaXJlY3Rpb24pICsgY2hhbmdlICsgb3RoZXJQaW5PZmZzZXQgOiAwO1xuXHQgICAgICAgICAgaSAmJiBzcGFjZXJTdGF0ZS5wdXNoKGRpcmVjdGlvbi5kLCBpICsgX3B4KTtcblxuXHQgICAgICAgICAgX3NldFN0YXRlKHNwYWNlclN0YXRlKTtcblxuXHQgICAgICAgICAgdXNlRml4ZWRQb3NpdGlvbiAmJiBzY3JvbGxGdW5jKHByZXZTY3JvbGwpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmICh1c2VGaXhlZFBvc2l0aW9uKSB7XG5cdCAgICAgICAgICBvdmVycmlkZSA9IHtcblx0ICAgICAgICAgICAgdG9wOiBib3VuZHMudG9wICsgKGlzVmVydGljYWwgPyBzY3JvbGwgLSBzdGFydCA6IG9wcG9zaXRlU2Nyb2xsKSArIF9weCxcblx0ICAgICAgICAgICAgbGVmdDogYm91bmRzLmxlZnQgKyAoaXNWZXJ0aWNhbCA/IG9wcG9zaXRlU2Nyb2xsIDogc2Nyb2xsIC0gc3RhcnQpICsgX3B4LFxuXHQgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxuXHQgICAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiXG5cdCAgICAgICAgICB9O1xuXHQgICAgICAgICAgb3ZlcnJpZGVbX3dpZHRoXSA9IG92ZXJyaWRlW1wibWF4XCIgKyBfV2lkdGhdID0gTWF0aC5jZWlsKGJvdW5kcy53aWR0aCkgKyBfcHg7XG5cdCAgICAgICAgICBvdmVycmlkZVtfaGVpZ2h0XSA9IG92ZXJyaWRlW1wibWF4XCIgKyBfSGVpZ2h0XSA9IE1hdGguY2VpbChib3VuZHMuaGVpZ2h0KSArIF9weDtcblx0ICAgICAgICAgIG92ZXJyaWRlW19tYXJnaW5dID0gb3ZlcnJpZGVbX21hcmdpbiArIF9Ub3BdID0gb3ZlcnJpZGVbX21hcmdpbiArIF9SaWdodF0gPSBvdmVycmlkZVtfbWFyZ2luICsgX0JvdHRvbV0gPSBvdmVycmlkZVtfbWFyZ2luICsgX0xlZnRdID0gXCIwXCI7XG5cdCAgICAgICAgICBvdmVycmlkZVtfcGFkZGluZ10gPSBjc1tfcGFkZGluZ107XG5cdCAgICAgICAgICBvdmVycmlkZVtfcGFkZGluZyArIF9Ub3BdID0gY3NbX3BhZGRpbmcgKyBfVG9wXTtcblx0ICAgICAgICAgIG92ZXJyaWRlW19wYWRkaW5nICsgX1JpZ2h0XSA9IGNzW19wYWRkaW5nICsgX1JpZ2h0XTtcblx0ICAgICAgICAgIG92ZXJyaWRlW19wYWRkaW5nICsgX0JvdHRvbV0gPSBjc1tfcGFkZGluZyArIF9Cb3R0b21dO1xuXHQgICAgICAgICAgb3ZlcnJpZGVbX3BhZGRpbmcgKyBfTGVmdF0gPSBjc1tfcGFkZGluZyArIF9MZWZ0XTtcblx0ICAgICAgICAgIHBpbkFjdGl2ZVN0YXRlID0gX2NvcHlTdGF0ZShwaW5PcmlnaW5hbFN0YXRlLCBvdmVycmlkZSwgcGluUmVwYXJlbnQpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmIChhbmltYXRpb24pIHtcblx0ICAgICAgICAgIGluaXR0ZWQgPSBhbmltYXRpb24uX2luaXR0ZWQ7XG5cblx0ICAgICAgICAgIF9zdXBwcmVzc092ZXJ3cml0ZXMoMSk7XG5cblx0ICAgICAgICAgIGFuaW1hdGlvbi5yZW5kZXIoYW5pbWF0aW9uLmR1cmF0aW9uKCksIHRydWUsIHRydWUpO1xuXHQgICAgICAgICAgcGluQ2hhbmdlID0gcGluR2V0dGVyKGRpcmVjdGlvbi5hKSAtIHBpblN0YXJ0ICsgY2hhbmdlICsgb3RoZXJQaW5PZmZzZXQ7XG5cdCAgICAgICAgICBjaGFuZ2UgIT09IHBpbkNoYW5nZSAmJiBwaW5BY3RpdmVTdGF0ZS5zcGxpY2UocGluQWN0aXZlU3RhdGUubGVuZ3RoIC0gMiwgMik7XG5cdCAgICAgICAgICBhbmltYXRpb24ucmVuZGVyKDAsIHRydWUsIHRydWUpO1xuXHQgICAgICAgICAgaW5pdHRlZCB8fCBhbmltYXRpb24uaW52YWxpZGF0ZSgpO1xuXG5cdCAgICAgICAgICBfc3VwcHJlc3NPdmVyd3JpdGVzKDApO1xuXHQgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICBwaW5DaGFuZ2UgPSBjaGFuZ2U7XG5cdCAgICAgICAgfVxuXHQgICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgJiYgc2Nyb2xsRnVuYygpICYmICFjb250YWluZXJBbmltYXRpb24pIHtcblx0ICAgICAgICBib3VuZHMgPSB0cmlnZ2VyLnBhcmVudE5vZGU7XG5cblx0ICAgICAgICB3aGlsZSAoYm91bmRzICYmIGJvdW5kcyAhPT0gX2JvZHkpIHtcblx0ICAgICAgICAgIGlmIChib3VuZHMuX3Bpbk9mZnNldCkge1xuXHQgICAgICAgICAgICBzdGFydCAtPSBib3VuZHMuX3Bpbk9mZnNldDtcblx0ICAgICAgICAgICAgZW5kIC09IGJvdW5kcy5fcGluT2Zmc2V0O1xuXHQgICAgICAgICAgfVxuXG5cdCAgICAgICAgICBib3VuZHMgPSBib3VuZHMucGFyZW50Tm9kZTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICByZXZlcnRlZFBpbnMgJiYgcmV2ZXJ0ZWRQaW5zLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICByZXR1cm4gdC5yZXZlcnQoZmFsc2UpO1xuXHQgICAgICB9KTtcblx0ICAgICAgc2VsZi5zdGFydCA9IHN0YXJ0O1xuXHQgICAgICBzZWxmLmVuZCA9IGVuZDtcblx0ICAgICAgc2Nyb2xsMSA9IHNjcm9sbDIgPSBzY3JvbGxGdW5jKCk7XG5cblx0ICAgICAgaWYgKCFjb250YWluZXJBbmltYXRpb24pIHtcblx0ICAgICAgICBzY3JvbGwxIDwgcHJldlNjcm9sbCAmJiBzY3JvbGxGdW5jKHByZXZTY3JvbGwpO1xuXHQgICAgICAgIHNlbGYuc2Nyb2xsLnJlYyA9IDA7XG5cdCAgICAgIH1cblxuXHQgICAgICBzZWxmLnJldmVydChmYWxzZSk7XG5cdCAgICAgIF9yZWZyZXNoaW5nID0gMDtcblx0ICAgICAgYW5pbWF0aW9uICYmIGlzVG9nZ2xlICYmIGFuaW1hdGlvbi5faW5pdHRlZCAmJiBhbmltYXRpb24ucHJvZ3Jlc3MoKSAhPT0gcHJldkFuaW1Qcm9ncmVzcyAmJiBhbmltYXRpb24ucHJvZ3Jlc3MocHJldkFuaW1Qcm9ncmVzcywgdHJ1ZSkucmVuZGVyKGFuaW1hdGlvbi50aW1lKCksIHRydWUsIHRydWUpO1xuXG5cdCAgICAgIGlmIChwcmV2UHJvZ3Jlc3MgIT09IHNlbGYucHJvZ3Jlc3MgfHwgY29udGFpbmVyQW5pbWF0aW9uKSB7XG5cdCAgICAgICAgYW5pbWF0aW9uICYmICFpc1RvZ2dsZSAmJiBhbmltYXRpb24udG90YWxQcm9ncmVzcyhwcmV2UHJvZ3Jlc3MsIHRydWUpO1xuXHQgICAgICAgIHNlbGYucHJvZ3Jlc3MgPSBwcmV2UHJvZ3Jlc3M7XG5cdCAgICAgICAgc2VsZi51cGRhdGUoMCwgMCwgMSk7XG5cdCAgICAgIH1cblxuXHQgICAgICBwaW4gJiYgcGluU3BhY2luZyAmJiAoc3BhY2VyLl9waW5PZmZzZXQgPSBNYXRoLnJvdW5kKHNlbGYucHJvZ3Jlc3MgKiBwaW5DaGFuZ2UpKTtcblx0ICAgICAgb25SZWZyZXNoICYmIG9uUmVmcmVzaChzZWxmKTtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYuZ2V0VmVsb2NpdHkgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIHJldHVybiAoc2Nyb2xsRnVuYygpIC0gc2Nyb2xsMikgLyAoX2dldFRpbWUoKSAtIF90aW1lMikgKiAxMDAwIHx8IDA7XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmVuZEFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgX2VuZEFuaW1hdGlvbihzZWxmLmNhbGxiYWNrQW5pbWF0aW9uKTtcblxuXHQgICAgICBpZiAoYW5pbWF0aW9uKSB7XG5cdCAgICAgICAgc2NydWJUd2VlbiA/IHNjcnViVHdlZW4ucHJvZ3Jlc3MoMSkgOiAhYW5pbWF0aW9uLnBhdXNlZCgpID8gX2VuZEFuaW1hdGlvbihhbmltYXRpb24sIGFuaW1hdGlvbi5yZXZlcnNlZCgpKSA6IGlzVG9nZ2xlIHx8IF9lbmRBbmltYXRpb24oYW5pbWF0aW9uLCBzZWxmLmRpcmVjdGlvbiA8IDAsIDEpO1xuXHQgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmxhYmVsVG9TY3JvbGwgPSBmdW5jdGlvbiAobGFiZWwpIHtcblx0ICAgICAgcmV0dXJuIGFuaW1hdGlvbiAmJiBhbmltYXRpb24ubGFiZWxzICYmIChzdGFydCB8fCBzZWxmLnJlZnJlc2goKSB8fCBzdGFydCkgKyBhbmltYXRpb24ubGFiZWxzW2xhYmVsXSAvIGFuaW1hdGlvbi5kdXJhdGlvbigpICogY2hhbmdlIHx8IDA7XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmdldFRyYWlsaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcblx0ICAgICAgdmFyIGkgPSBfdHJpZ2dlcnMuaW5kZXhPZihzZWxmKSxcblx0ICAgICAgICAgIGEgPSBzZWxmLmRpcmVjdGlvbiA+IDAgPyBfdHJpZ2dlcnMuc2xpY2UoMCwgaSkucmV2ZXJzZSgpIDogX3RyaWdnZXJzLnNsaWNlKGkgKyAxKTtcblxuXHQgICAgICByZXR1cm4gX2lzU3RyaW5nKG5hbWUpID8gYS5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICByZXR1cm4gdC52YXJzLnByZXZlbnRPdmVybGFwcyA9PT0gbmFtZTtcblx0ICAgICAgfSkgOiBhO1xuXHQgICAgfTtcblxuXHQgICAgc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAocmVzZXQsIHJlY29yZFZlbG9jaXR5LCBmb3JjZUZha2UpIHtcblx0ICAgICAgaWYgKGNvbnRhaW5lckFuaW1hdGlvbiAmJiAhZm9yY2VGYWtlICYmICFyZXNldCkge1xuXHQgICAgICAgIHJldHVybjtcblx0ICAgICAgfVxuXG5cdCAgICAgIHZhciBzY3JvbGwgPSBzZWxmLnNjcm9sbCgpLFxuXHQgICAgICAgICAgcCA9IHJlc2V0ID8gMCA6IChzY3JvbGwgLSBzdGFydCkgLyBjaGFuZ2UsXG5cdCAgICAgICAgICBjbGlwcGVkID0gcCA8IDAgPyAwIDogcCA+IDEgPyAxIDogcCB8fCAwLFxuXHQgICAgICAgICAgcHJldlByb2dyZXNzID0gc2VsZi5wcm9ncmVzcyxcblx0ICAgICAgICAgIGlzQWN0aXZlLFxuXHQgICAgICAgICAgd2FzQWN0aXZlLFxuXHQgICAgICAgICAgdG9nZ2xlU3RhdGUsXG5cdCAgICAgICAgICBhY3Rpb24sXG5cdCAgICAgICAgICBzdGF0ZUNoYW5nZWQsXG5cdCAgICAgICAgICB0b2dnbGVkLFxuXHQgICAgICAgICAgaXNBdE1heCxcblx0ICAgICAgICAgIGlzVGFraW5nQWN0aW9uO1xuXG5cdCAgICAgIGlmIChyZWNvcmRWZWxvY2l0eSkge1xuXHQgICAgICAgIHNjcm9sbDIgPSBzY3JvbGwxO1xuXHQgICAgICAgIHNjcm9sbDEgPSBjb250YWluZXJBbmltYXRpb24gPyBzY3JvbGxGdW5jKCkgOiBzY3JvbGw7XG5cblx0ICAgICAgICBpZiAoc25hcCkge1xuXHQgICAgICAgICAgc25hcDIgPSBzbmFwMTtcblx0ICAgICAgICAgIHNuYXAxID0gYW5pbWF0aW9uICYmICFpc1RvZ2dsZSA/IGFuaW1hdGlvbi50b3RhbFByb2dyZXNzKCkgOiBjbGlwcGVkO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXG5cdCAgICAgIGFudGljaXBhdGVQaW4gJiYgIWNsaXBwZWQgJiYgcGluICYmICFfcmVmcmVzaGluZyAmJiAhX3N0YXJ0dXAgJiYgX2xhc3RTY3JvbGxUaW1lICYmIHN0YXJ0IDwgc2Nyb2xsICsgKHNjcm9sbCAtIHNjcm9sbDIpIC8gKF9nZXRUaW1lKCkgLSBfdGltZTIpICogYW50aWNpcGF0ZVBpbiAmJiAoY2xpcHBlZCA9IDAuMDAwMSk7XG5cblx0ICAgICAgaWYgKGNsaXBwZWQgIT09IHByZXZQcm9ncmVzcyAmJiBzZWxmLmVuYWJsZWQpIHtcblx0ICAgICAgICBpc0FjdGl2ZSA9IHNlbGYuaXNBY3RpdmUgPSAhIWNsaXBwZWQgJiYgY2xpcHBlZCA8IDE7XG5cdCAgICAgICAgd2FzQWN0aXZlID0gISFwcmV2UHJvZ3Jlc3MgJiYgcHJldlByb2dyZXNzIDwgMTtcblx0ICAgICAgICB0b2dnbGVkID0gaXNBY3RpdmUgIT09IHdhc0FjdGl2ZTtcblx0ICAgICAgICBzdGF0ZUNoYW5nZWQgPSB0b2dnbGVkIHx8ICEhY2xpcHBlZCAhPT0gISFwcmV2UHJvZ3Jlc3M7XG5cdCAgICAgICAgc2VsZi5kaXJlY3Rpb24gPSBjbGlwcGVkID4gcHJldlByb2dyZXNzID8gMSA6IC0xO1xuXHQgICAgICAgIHNlbGYucHJvZ3Jlc3MgPSBjbGlwcGVkO1xuXG5cdCAgICAgICAgaWYgKHN0YXRlQ2hhbmdlZCAmJiAhX3JlZnJlc2hpbmcpIHtcblx0ICAgICAgICAgIHRvZ2dsZVN0YXRlID0gY2xpcHBlZCAmJiAhcHJldlByb2dyZXNzID8gMCA6IGNsaXBwZWQgPT09IDEgPyAxIDogcHJldlByb2dyZXNzID09PSAxID8gMiA6IDM7XG5cblx0ICAgICAgICAgIGlmIChpc1RvZ2dsZSkge1xuXHQgICAgICAgICAgICBhY3Rpb24gPSAhdG9nZ2xlZCAmJiB0b2dnbGVBY3Rpb25zW3RvZ2dsZVN0YXRlICsgMV0gIT09IFwibm9uZVwiICYmIHRvZ2dsZUFjdGlvbnNbdG9nZ2xlU3RhdGUgKyAxXSB8fCB0b2dnbGVBY3Rpb25zW3RvZ2dsZVN0YXRlXTtcblx0ICAgICAgICAgICAgaXNUYWtpbmdBY3Rpb24gPSBhbmltYXRpb24gJiYgKGFjdGlvbiA9PT0gXCJjb21wbGV0ZVwiIHx8IGFjdGlvbiA9PT0gXCJyZXNldFwiIHx8IGFjdGlvbiBpbiBhbmltYXRpb24pO1xuXHQgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHByZXZlbnRPdmVybGFwcyAmJiB0b2dnbGVkICYmIChpc1Rha2luZ0FjdGlvbiB8fCBzY3J1YiB8fCAhYW5pbWF0aW9uKSAmJiAoX2lzRnVuY3Rpb24ocHJldmVudE92ZXJsYXBzKSA/IHByZXZlbnRPdmVybGFwcyhzZWxmKSA6IHNlbGYuZ2V0VHJhaWxpbmcocHJldmVudE92ZXJsYXBzKS5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgICByZXR1cm4gdC5lbmRBbmltYXRpb24oKTtcblx0ICAgICAgICB9KSk7XG5cblx0ICAgICAgICBpZiAoIWlzVG9nZ2xlKSB7XG5cdCAgICAgICAgICBpZiAoc2NydWJUd2VlbiAmJiAhX3JlZnJlc2hpbmcgJiYgIV9zdGFydHVwKSB7XG5cdCAgICAgICAgICAgIHNjcnViVHdlZW4udmFycy50b3RhbFByb2dyZXNzID0gY2xpcHBlZDtcblx0ICAgICAgICAgICAgc2NydWJUd2Vlbi5pbnZhbGlkYXRlKCkucmVzdGFydCgpO1xuXHQgICAgICAgICAgfSBlbHNlIGlmIChhbmltYXRpb24pIHtcblx0ICAgICAgICAgICAgYW5pbWF0aW9uLnRvdGFsUHJvZ3Jlc3MoY2xpcHBlZCwgISFfcmVmcmVzaGluZyk7XG5cdCAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKHBpbikge1xuXHQgICAgICAgICAgcmVzZXQgJiYgcGluU3BhY2luZyAmJiAoc3BhY2VyLnN0eWxlW3BpblNwYWNpbmcgKyBkaXJlY3Rpb24ub3MyXSA9IHNwYWNpbmdTdGFydCk7XG5cblx0ICAgICAgICAgIGlmICghdXNlRml4ZWRQb3NpdGlvbikge1xuXHQgICAgICAgICAgICBwaW5TZXR0ZXIocGluU3RhcnQgKyBwaW5DaGFuZ2UgKiBjbGlwcGVkKTtcblx0ICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGVDaGFuZ2VkKSB7XG5cdCAgICAgICAgICAgIGlzQXRNYXggPSAhcmVzZXQgJiYgY2xpcHBlZCA+IHByZXZQcm9ncmVzcyAmJiBlbmQgKyAxID4gc2Nyb2xsICYmIHNjcm9sbCArIDEgPj0gX21heFNjcm9sbChzY3JvbGxlciwgZGlyZWN0aW9uKTtcblxuXHQgICAgICAgICAgICBpZiAocGluUmVwYXJlbnQpIHtcblx0ICAgICAgICAgICAgICBpZiAoIXJlc2V0ICYmIChpc0FjdGl2ZSB8fCBpc0F0TWF4KSkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IF9nZXRCb3VuZHMocGluLCB0cnVlKSxcblx0ICAgICAgICAgICAgICAgICAgICBfb2Zmc2V0ID0gc2Nyb2xsIC0gc3RhcnQ7XG5cblx0ICAgICAgICAgICAgICAgIF9yZXBhcmVudChwaW4sIF9ib2R5LCBib3VuZHMudG9wICsgKGRpcmVjdGlvbiA9PT0gX3ZlcnRpY2FsID8gX29mZnNldCA6IDApICsgX3B4LCBib3VuZHMubGVmdCArIChkaXJlY3Rpb24gPT09IF92ZXJ0aWNhbCA/IDAgOiBfb2Zmc2V0KSArIF9weCk7XG5cdCAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIF9yZXBhcmVudChwaW4sIHNwYWNlcik7XG5cdCAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgX3NldFN0YXRlKGlzQWN0aXZlIHx8IGlzQXRNYXggPyBwaW5BY3RpdmVTdGF0ZSA6IHBpblN0YXRlKTtcblxuXHQgICAgICAgICAgICBwaW5DaGFuZ2UgIT09IGNoYW5nZSAmJiBjbGlwcGVkIDwgMSAmJiBpc0FjdGl2ZSB8fCBwaW5TZXR0ZXIocGluU3RhcnQgKyAoY2xpcHBlZCA9PT0gMSAmJiAhaXNBdE1heCA/IHBpbkNoYW5nZSA6IDApKTtcblx0ICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICBzbmFwICYmICF0d2VlblRvLnR3ZWVuICYmICFfcmVmcmVzaGluZyAmJiAhX3N0YXJ0dXAgJiYgc25hcERlbGF5ZWRDYWxsLnJlc3RhcnQodHJ1ZSk7XG5cdCAgICAgICAgdG9nZ2xlQ2xhc3MgJiYgKHRvZ2dsZWQgfHwgb25jZSAmJiBjbGlwcGVkICYmIChjbGlwcGVkIDwgMSB8fCAhX2xpbWl0Q2FsbGJhY2tzKSkgJiYgX3RvQXJyYXkodG9nZ2xlQ2xhc3MudGFyZ2V0cykuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcblx0ICAgICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3RbaXNBY3RpdmUgfHwgb25jZSA/IFwiYWRkXCIgOiBcInJlbW92ZVwiXSh0b2dnbGVDbGFzcy5jbGFzc05hbWUpO1xuXHQgICAgICAgIH0pO1xuXHQgICAgICAgIG9uVXBkYXRlICYmICFpc1RvZ2dsZSAmJiAhcmVzZXQgJiYgb25VcGRhdGUoc2VsZik7XG5cblx0ICAgICAgICBpZiAoc3RhdGVDaGFuZ2VkICYmICFfcmVmcmVzaGluZykge1xuXHQgICAgICAgICAgaWYgKGlzVG9nZ2xlKSB7XG5cdCAgICAgICAgICAgIGlmIChpc1Rha2luZ0FjdGlvbikge1xuXHQgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwiY29tcGxldGVcIikge1xuXHQgICAgICAgICAgICAgICAgYW5pbWF0aW9uLnBhdXNlKCkudG90YWxQcm9ncmVzcygxKTtcblx0ICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gXCJyZXNldFwiKSB7XG5cdCAgICAgICAgICAgICAgICBhbmltYXRpb24ucmVzdGFydCh0cnVlKS5wYXVzZSgpO1xuXHQgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBcInJlc3RhcnRcIikge1xuXHQgICAgICAgICAgICAgICAgYW5pbWF0aW9uLnJlc3RhcnQodHJ1ZSk7XG5cdCAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIGFuaW1hdGlvblthY3Rpb25dKCk7XG5cdCAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgb25VcGRhdGUgJiYgb25VcGRhdGUoc2VsZik7XG5cdCAgICAgICAgICB9XG5cblx0ICAgICAgICAgIGlmICh0b2dnbGVkIHx8ICFfbGltaXRDYWxsYmFja3MpIHtcblx0ICAgICAgICAgICAgb25Ub2dnbGUgJiYgdG9nZ2xlZCAmJiBfY2FsbGJhY2soc2VsZiwgb25Ub2dnbGUpO1xuXHQgICAgICAgICAgICBjYWxsYmFja3NbdG9nZ2xlU3RhdGVdICYmIF9jYWxsYmFjayhzZWxmLCBjYWxsYmFja3NbdG9nZ2xlU3RhdGVdKTtcblx0ICAgICAgICAgICAgb25jZSAmJiAoY2xpcHBlZCA9PT0gMSA/IHNlbGYua2lsbChmYWxzZSwgMSkgOiBjYWxsYmFja3NbdG9nZ2xlU3RhdGVdID0gMCk7XG5cblx0ICAgICAgICAgICAgaWYgKCF0b2dnbGVkKSB7XG5cdCAgICAgICAgICAgICAgdG9nZ2xlU3RhdGUgPSBjbGlwcGVkID09PSAxID8gMSA6IDM7XG5cdCAgICAgICAgICAgICAgY2FsbGJhY2tzW3RvZ2dsZVN0YXRlXSAmJiBfY2FsbGJhY2soc2VsZiwgY2FsbGJhY2tzW3RvZ2dsZVN0YXRlXSk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgIH1cblxuXHQgICAgICAgICAgaWYgKGZhc3RTY3JvbGxFbmQgJiYgIWlzQWN0aXZlICYmIE1hdGguYWJzKHNlbGYuZ2V0VmVsb2NpdHkoKSkgPiAoX2lzTnVtYmVyKGZhc3RTY3JvbGxFbmQpID8gZmFzdFNjcm9sbEVuZCA6IDI1MDApKSB7XG5cdCAgICAgICAgICAgIF9lbmRBbmltYXRpb24oc2VsZi5jYWxsYmFja0FuaW1hdGlvbik7XG5cblx0ICAgICAgICAgICAgc2NydWJUd2VlbiA/IHNjcnViVHdlZW4ucHJvZ3Jlc3MoMSkgOiBfZW5kQW5pbWF0aW9uKGFuaW1hdGlvbiwgIWNsaXBwZWQsIDEpO1xuXHQgICAgICAgICAgfVxuXHQgICAgICAgIH0gZWxzZSBpZiAoaXNUb2dnbGUgJiYgb25VcGRhdGUgJiYgIV9yZWZyZXNoaW5nKSB7XG5cdCAgICAgICAgICBvblVwZGF0ZShzZWxmKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICBpZiAobWFya2VyRW5kU2V0dGVyKSB7XG5cdCAgICAgICAgdmFyIG4gPSBjb250YWluZXJBbmltYXRpb24gPyBzY3JvbGwgLyBjb250YWluZXJBbmltYXRpb24uZHVyYXRpb24oKSAqIChjb250YWluZXJBbmltYXRpb24uX2NhU2Nyb2xsRGlzdCB8fCAwKSA6IHNjcm9sbDtcblx0ICAgICAgICBtYXJrZXJTdGFydFNldHRlcihuICsgKG1hcmtlclN0YXJ0VHJpZ2dlci5faXNGbGlwcGVkID8gMSA6IDApKTtcblx0ICAgICAgICBtYXJrZXJFbmRTZXR0ZXIobik7XG5cdCAgICAgIH1cblxuXHQgICAgICBjYU1hcmtlclNldHRlciAmJiBjYU1hcmtlclNldHRlcigtc2Nyb2xsIC8gY29udGFpbmVyQW5pbWF0aW9uLmR1cmF0aW9uKCkgKiAoY29udGFpbmVyQW5pbWF0aW9uLl9jYVNjcm9sbERpc3QgfHwgMCkpO1xuXHQgICAgfTtcblxuXHQgICAgc2VsZi5lbmFibGUgPSBmdW5jdGlvbiAocmVzZXQsIHJlZnJlc2gpIHtcblx0ICAgICAgaWYgKCFzZWxmLmVuYWJsZWQpIHtcblx0ICAgICAgICBzZWxmLmVuYWJsZWQgPSB0cnVlO1xuXG5cdCAgICAgICAgX2FkZExpc3RlbmVyKHNjcm9sbGVyLCBcInJlc2l6ZVwiLCBfb25SZXNpemUpO1xuXG5cdCAgICAgICAgX2FkZExpc3RlbmVyKHNjcm9sbGVyLCBcInNjcm9sbFwiLCBfb25TY3JvbGwpO1xuXG5cdCAgICAgICAgb25SZWZyZXNoSW5pdCAmJiBfYWRkTGlzdGVuZXIoU2Nyb2xsVHJpZ2dlciwgXCJyZWZyZXNoSW5pdFwiLCBvblJlZnJlc2hJbml0KTtcblxuXHQgICAgICAgIGlmIChyZXNldCAhPT0gZmFsc2UpIHtcblx0ICAgICAgICAgIHNlbGYucHJvZ3Jlc3MgPSBwcmV2UHJvZ3Jlc3MgPSAwO1xuXHQgICAgICAgICAgc2Nyb2xsMSA9IHNjcm9sbDIgPSBsYXN0U25hcCA9IHNjcm9sbEZ1bmMoKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZWZyZXNoICE9PSBmYWxzZSAmJiBzZWxmLnJlZnJlc2goKTtcblx0ICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgc2VsZi5nZXRUd2VlbiA9IGZ1bmN0aW9uIChzbmFwKSB7XG5cdCAgICAgIHJldHVybiBzbmFwICYmIHR3ZWVuVG8gPyB0d2VlblRvLnR3ZWVuIDogc2NydWJUd2Vlbjtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYuc2V0UG9zaXRpb25zID0gZnVuY3Rpb24gKG5ld1N0YXJ0LCBuZXdFbmQpIHtcblx0ICAgICAgaWYgKHBpbikge1xuXHQgICAgICAgIHBpblN0YXJ0ICs9IG5ld1N0YXJ0IC0gc3RhcnQ7XG5cdCAgICAgICAgcGluQ2hhbmdlICs9IG5ld0VuZCAtIG5ld1N0YXJ0IC0gY2hhbmdlO1xuXHQgICAgICB9XG5cblx0ICAgICAgc2VsZi5zdGFydCA9IHN0YXJ0ID0gbmV3U3RhcnQ7XG5cdCAgICAgIHNlbGYuZW5kID0gZW5kID0gbmV3RW5kO1xuXHQgICAgICBjaGFuZ2UgPSBuZXdFbmQgLSBuZXdTdGFydDtcblx0ICAgICAgc2VsZi51cGRhdGUoKTtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYuZGlzYWJsZSA9IGZ1bmN0aW9uIChyZXNldCwgYWxsb3dBbmltYXRpb24pIHtcblx0ICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuXHQgICAgICAgIHJlc2V0ICE9PSBmYWxzZSAmJiBzZWxmLnJldmVydCgpO1xuXHQgICAgICAgIHNlbGYuZW5hYmxlZCA9IHNlbGYuaXNBY3RpdmUgPSBmYWxzZTtcblx0ICAgICAgICBhbGxvd0FuaW1hdGlvbiB8fCBzY3J1YlR3ZWVuICYmIHNjcnViVHdlZW4ucGF1c2UoKTtcblx0ICAgICAgICBwcmV2U2Nyb2xsID0gMDtcblx0ICAgICAgICBwaW5DYWNoZSAmJiAocGluQ2FjaGUudW5jYWNoZSA9IDEpO1xuXHQgICAgICAgIG9uUmVmcmVzaEluaXQgJiYgX3JlbW92ZUxpc3RlbmVyKFNjcm9sbFRyaWdnZXIsIFwicmVmcmVzaEluaXRcIiwgb25SZWZyZXNoSW5pdCk7XG5cblx0ICAgICAgICBpZiAoc25hcERlbGF5ZWRDYWxsKSB7XG5cdCAgICAgICAgICBzbmFwRGVsYXllZENhbGwucGF1c2UoKTtcblx0ICAgICAgICAgIHR3ZWVuVG8udHdlZW4gJiYgdHdlZW5Uby50d2Vlbi5raWxsKCkgJiYgKHR3ZWVuVG8udHdlZW4gPSAwKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBpZiAoIWlzVmlld3BvcnQpIHtcblx0ICAgICAgICAgIHZhciBpID0gX3RyaWdnZXJzLmxlbmd0aDtcblxuXHQgICAgICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgICAgICBpZiAoX3RyaWdnZXJzW2ldLnNjcm9sbGVyID09PSBzY3JvbGxlciAmJiBfdHJpZ2dlcnNbaV0gIT09IHNlbGYpIHtcblx0ICAgICAgICAgICAgICByZXR1cm47XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgIH1cblxuXHQgICAgICAgICAgX3JlbW92ZUxpc3RlbmVyKHNjcm9sbGVyLCBcInJlc2l6ZVwiLCBfb25SZXNpemUpO1xuXG5cdCAgICAgICAgICBfcmVtb3ZlTGlzdGVuZXIoc2Nyb2xsZXIsIFwic2Nyb2xsXCIsIF9vblNjcm9sbCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmtpbGwgPSBmdW5jdGlvbiAocmV2ZXJ0LCBhbGxvd0FuaW1hdGlvbikge1xuXHQgICAgICBzZWxmLmRpc2FibGUocmV2ZXJ0LCBhbGxvd0FuaW1hdGlvbik7XG5cdCAgICAgIHNjcnViVHdlZW4gJiYgc2NydWJUd2Vlbi5raWxsKCk7XG5cdCAgICAgIGlkICYmIGRlbGV0ZSBfaWRzW2lkXTtcblxuXHQgICAgICB2YXIgaSA9IF90cmlnZ2Vycy5pbmRleE9mKHNlbGYpO1xuXG5cdCAgICAgIGkgPj0gMCAmJiBfdHJpZ2dlcnMuc3BsaWNlKGksIDEpO1xuXHQgICAgICBpID09PSBfaSAmJiBfZGlyZWN0aW9uID4gMCAmJiBfaS0tO1xuXHQgICAgICBpID0gMDtcblxuXHQgICAgICBfdHJpZ2dlcnMuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuXHQgICAgICAgIHJldHVybiB0LnNjcm9sbGVyID09PSBzZWxmLnNjcm9sbGVyICYmIChpID0gMSk7XG5cdCAgICAgIH0pO1xuXG5cdCAgICAgIGkgfHwgKHNlbGYuc2Nyb2xsLnJlYyA9IDApO1xuXG5cdCAgICAgIGlmIChhbmltYXRpb24pIHtcblx0ICAgICAgICBhbmltYXRpb24uc2Nyb2xsVHJpZ2dlciA9IG51bGw7XG5cdCAgICAgICAgcmV2ZXJ0ICYmIGFuaW1hdGlvbi5yZW5kZXIoLTEpO1xuXHQgICAgICAgIGFsbG93QW5pbWF0aW9uIHx8IGFuaW1hdGlvbi5raWxsKCk7XG5cdCAgICAgIH1cblxuXHQgICAgICBtYXJrZXJTdGFydCAmJiBbbWFya2VyU3RhcnQsIG1hcmtlckVuZCwgbWFya2VyU3RhcnRUcmlnZ2VyLCBtYXJrZXJFbmRUcmlnZ2VyXS5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG5cdCAgICAgICAgcmV0dXJuIG0ucGFyZW50Tm9kZSAmJiBtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobSk7XG5cdCAgICAgIH0pO1xuXG5cdCAgICAgIGlmIChwaW4pIHtcblx0ICAgICAgICBwaW5DYWNoZSAmJiAocGluQ2FjaGUudW5jYWNoZSA9IDEpO1xuXHQgICAgICAgIGkgPSAwO1xuXG5cdCAgICAgICAgX3RyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICAgIHJldHVybiB0LnBpbiA9PT0gcGluICYmIGkrKztcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGkgfHwgKHBpbkNhY2hlLnNwYWNlciA9IDApO1xuXHQgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmVuYWJsZShmYWxzZSwgZmFsc2UpO1xuXHQgICAgIWFuaW1hdGlvbiB8fCAhYW5pbWF0aW9uLmFkZCB8fCBjaGFuZ2UgPyBzZWxmLnJlZnJlc2goKSA6IGdzYXAuZGVsYXllZENhbGwoMC4wMSwgZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gc3RhcnQgfHwgZW5kIHx8IHNlbGYucmVmcmVzaCgpO1xuXHQgICAgfSkgJiYgKGNoYW5nZSA9IDAuMDEpICYmIChzdGFydCA9IGVuZCA9IDApO1xuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIoY29yZSkge1xuXHQgICAgaWYgKCFfY29yZUluaXR0ZWQpIHtcblx0ICAgICAgZ3NhcCA9IGNvcmUgfHwgX2dldEdTQVAoKTtcblxuXHQgICAgICBpZiAoX3dpbmRvd0V4aXN0cygpICYmIHdpbmRvdy5kb2N1bWVudCkge1xuXHQgICAgICAgIF93aW4gPSB3aW5kb3c7XG5cdCAgICAgICAgX2RvYyA9IGRvY3VtZW50O1xuXHQgICAgICAgIF9kb2NFbCA9IF9kb2MuZG9jdW1lbnRFbGVtZW50O1xuXHQgICAgICAgIF9ib2R5ID0gX2RvYy5ib2R5O1xuXHQgICAgICB9XG5cblx0ICAgICAgaWYgKGdzYXApIHtcblx0ICAgICAgICBfdG9BcnJheSA9IGdzYXAudXRpbHMudG9BcnJheTtcblx0ICAgICAgICBfY2xhbXAgPSBnc2FwLnV0aWxzLmNsYW1wO1xuXHQgICAgICAgIF9zdXBwcmVzc092ZXJ3cml0ZXMgPSBnc2FwLmNvcmUuc3VwcHJlc3NPdmVyd3JpdGVzIHx8IF9wYXNzVGhyb3VnaDtcblx0ICAgICAgICBnc2FwLmNvcmUuZ2xvYmFscyhcIlNjcm9sbFRyaWdnZXJcIiwgU2Nyb2xsVHJpZ2dlcik7XG5cblx0ICAgICAgICBpZiAoX2JvZHkpIHtcblx0ICAgICAgICAgIF9hZGRMaXN0ZW5lcihfd2luLCBcIndoZWVsXCIsIF9vblNjcm9sbCk7XG5cblx0ICAgICAgICAgIF9yb290ID0gW193aW4sIF9kb2MsIF9kb2NFbCwgX2JvZHldO1xuXG5cdCAgICAgICAgICBfYWRkTGlzdGVuZXIoX2RvYywgXCJzY3JvbGxcIiwgX29uU2Nyb2xsKTtcblxuXHQgICAgICAgICAgdmFyIGJvZHlTdHlsZSA9IF9ib2R5LnN0eWxlLFxuXHQgICAgICAgICAgICAgIGJvcmRlciA9IGJvZHlTdHlsZS5ib3JkZXJUb3BTdHlsZSxcblx0ICAgICAgICAgICAgICBib3VuZHM7XG5cdCAgICAgICAgICBib2R5U3R5bGUuYm9yZGVyVG9wU3R5bGUgPSBcInNvbGlkXCI7XG5cdCAgICAgICAgICBib3VuZHMgPSBfZ2V0Qm91bmRzKF9ib2R5KTtcblx0ICAgICAgICAgIF92ZXJ0aWNhbC5tID0gTWF0aC5yb3VuZChib3VuZHMudG9wICsgX3ZlcnRpY2FsLnNjKCkpIHx8IDA7XG5cdCAgICAgICAgICBfaG9yaXpvbnRhbC5tID0gTWF0aC5yb3VuZChib3VuZHMubGVmdCArIF9ob3Jpem9udGFsLnNjKCkpIHx8IDA7XG5cdCAgICAgICAgICBib3JkZXIgPyBib2R5U3R5bGUuYm9yZGVyVG9wU3R5bGUgPSBib3JkZXIgOiBib2R5U3R5bGUucmVtb3ZlUHJvcGVydHkoXCJib3JkZXItdG9wLXN0eWxlXCIpO1xuXHQgICAgICAgICAgX3N5bmNJbnRlcnZhbCA9IHNldEludGVydmFsKF9zeW5jLCAyMDApO1xuXHQgICAgICAgICAgZ3NhcC5kZWxheWVkQ2FsbCgwLjUsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIF9zdGFydHVwID0gMDtcblx0ICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICBfYWRkTGlzdGVuZXIoX2RvYywgXCJ0b3VjaGNhbmNlbFwiLCBfcGFzc1Rocm91Z2gpO1xuXG5cdCAgICAgICAgICBfYWRkTGlzdGVuZXIoX2JvZHksIFwidG91Y2hzdGFydFwiLCBfcGFzc1Rocm91Z2gpO1xuXG5cdCAgICAgICAgICBfbXVsdGlMaXN0ZW5lcihfYWRkTGlzdGVuZXIsIF9kb2MsIFwicG9pbnRlcmRvd24sdG91Y2hzdGFydCxtb3VzZWRvd25cIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICByZXR1cm4gX3BvaW50ZXJJc0Rvd24gPSAxO1xuXHQgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgIF9tdWx0aUxpc3RlbmVyKF9hZGRMaXN0ZW5lciwgX2RvYywgXCJwb2ludGVydXAsdG91Y2hlbmQsbW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBfcG9pbnRlcklzRG93biA9IDA7XG5cdCAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgX3RyYW5zZm9ybVByb3AgPSBnc2FwLnV0aWxzLmNoZWNrUHJlZml4KFwidHJhbnNmb3JtXCIpO1xuXG5cdCAgICAgICAgICBfc3RhdGVQcm9wcy5wdXNoKF90cmFuc2Zvcm1Qcm9wKTtcblxuXHQgICAgICAgICAgX2NvcmVJbml0dGVkID0gX2dldFRpbWUoKTtcblx0ICAgICAgICAgIF9yZXNpemVEZWxheSA9IGdzYXAuZGVsYXllZENhbGwoMC4yLCBfcmVmcmVzaEFsbCkucGF1c2UoKTtcblx0ICAgICAgICAgIF9hdXRvUmVmcmVzaCA9IFtfZG9jLCBcInZpc2liaWxpdHljaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgdyA9IF93aW4uaW5uZXJXaWR0aCxcblx0ICAgICAgICAgICAgICAgIGggPSBfd2luLmlubmVySGVpZ2h0O1xuXG5cdCAgICAgICAgICAgIGlmIChfZG9jLmhpZGRlbikge1xuXHQgICAgICAgICAgICAgIF9wcmV2V2lkdGggPSB3O1xuXHQgICAgICAgICAgICAgIF9wcmV2SGVpZ2h0ID0gaDtcblx0ICAgICAgICAgICAgfSBlbHNlIGlmIChfcHJldldpZHRoICE9PSB3IHx8IF9wcmV2SGVpZ2h0ICE9PSBoKSB7XG5cdCAgICAgICAgICAgICAgX29uUmVzaXplKCk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgIH0sIF9kb2MsIFwiRE9NQ29udGVudExvYWRlZFwiLCBfcmVmcmVzaEFsbCwgX3dpbiwgXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIF9sYXN0U2Nyb2xsVGltZSB8fCBfcmVmcmVzaEFsbCgpO1xuXHQgICAgICAgICAgfSwgX3dpbiwgXCJyZXNpemVcIiwgX29uUmVzaXplXTtcblxuXHQgICAgICAgICAgX2l0ZXJhdGVBdXRvUmVmcmVzaChfYWRkTGlzdGVuZXIpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gX2NvcmVJbml0dGVkO1xuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLmRlZmF1bHRzID0gZnVuY3Rpb24gZGVmYXVsdHMoY29uZmlnKSB7XG5cdCAgICBpZiAoY29uZmlnKSB7XG5cdCAgICAgIGZvciAodmFyIHAgaW4gY29uZmlnKSB7XG5cdCAgICAgICAgX2RlZmF1bHRzW3BdID0gY29uZmlnW3BdO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBfZGVmYXVsdHM7XG5cdCAgfTtcblxuXHQgIFNjcm9sbFRyaWdnZXIua2lsbCA9IGZ1bmN0aW9uIGtpbGwoKSB7XG5cdCAgICBfZW5hYmxlZCA9IDA7XG5cblx0ICAgIF90cmlnZ2Vycy5zbGljZSgwKS5mb3JFYWNoKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG5cdCAgICAgIHJldHVybiB0cmlnZ2VyLmtpbGwoMSk7XG5cdCAgICB9KTtcblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5jb25maWcgPSBmdW5jdGlvbiBjb25maWcodmFycykge1xuXHQgICAgXCJsaW1pdENhbGxiYWNrc1wiIGluIHZhcnMgJiYgKF9saW1pdENhbGxiYWNrcyA9ICEhdmFycy5saW1pdENhbGxiYWNrcyk7XG5cdCAgICB2YXIgbXMgPSB2YXJzLnN5bmNJbnRlcnZhbDtcblx0ICAgIG1zICYmIGNsZWFySW50ZXJ2YWwoX3N5bmNJbnRlcnZhbCkgfHwgKF9zeW5jSW50ZXJ2YWwgPSBtcykgJiYgc2V0SW50ZXJ2YWwoX3N5bmMsIG1zKTtcblxuXHQgICAgaWYgKFwiYXV0b1JlZnJlc2hFdmVudHNcIiBpbiB2YXJzKSB7XG5cdCAgICAgIF9pdGVyYXRlQXV0b1JlZnJlc2goX3JlbW92ZUxpc3RlbmVyKSB8fCBfaXRlcmF0ZUF1dG9SZWZyZXNoKF9hZGRMaXN0ZW5lciwgdmFycy5hdXRvUmVmcmVzaEV2ZW50cyB8fCBcIm5vbmVcIik7XG5cdCAgICAgIF9pZ25vcmVSZXNpemUgPSAodmFycy5hdXRvUmVmcmVzaEV2ZW50cyArIFwiXCIpLmluZGV4T2YoXCJyZXNpemVcIikgPT09IC0xO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLnNjcm9sbGVyUHJveHkgPSBmdW5jdGlvbiBzY3JvbGxlclByb3h5KHRhcmdldCwgdmFycykge1xuXHQgICAgdmFyIHQgPSBfZ2V0VGFyZ2V0KHRhcmdldCksXG5cdCAgICAgICAgaSA9IF9zY3JvbGxlcnMuaW5kZXhPZih0KSxcblx0ICAgICAgICBpc1ZpZXdwb3J0ID0gX2lzVmlld3BvcnQodCk7XG5cblx0ICAgIGlmICh+aSkge1xuXHQgICAgICBfc2Nyb2xsZXJzLnNwbGljZShpLCBpc1ZpZXdwb3J0ID8gNiA6IDIpO1xuXHQgICAgfVxuXG5cdCAgICBpZiAodmFycykge1xuXHQgICAgICBpc1ZpZXdwb3J0ID8gX3Byb3hpZXMudW5zaGlmdChfd2luLCB2YXJzLCBfYm9keSwgdmFycywgX2RvY0VsLCB2YXJzKSA6IF9wcm94aWVzLnVuc2hpZnQodCwgdmFycyk7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIFNjcm9sbFRyaWdnZXIubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uIG1hdGNoTWVkaWEodmFycykge1xuXHQgICAgdmFyIG1xLCBwLCBpLCBmdW5jLCByZXN1bHQ7XG5cblx0ICAgIGZvciAocCBpbiB2YXJzKSB7XG5cdCAgICAgIGkgPSBfbWVkaWEuaW5kZXhPZihwKTtcblx0ICAgICAgZnVuYyA9IHZhcnNbcF07XG5cdCAgICAgIF9jcmVhdGluZ01lZGlhID0gcDtcblxuXHQgICAgICBpZiAocCA9PT0gXCJhbGxcIikge1xuXHQgICAgICAgIGZ1bmMoKTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBtcSA9IF93aW4ubWF0Y2hNZWRpYShwKTtcblxuXHQgICAgICAgIGlmIChtcSkge1xuXHQgICAgICAgICAgbXEubWF0Y2hlcyAmJiAocmVzdWx0ID0gZnVuYygpKTtcblxuXHQgICAgICAgICAgaWYgKH5pKSB7XG5cdCAgICAgICAgICAgIF9tZWRpYVtpICsgMV0gPSBfY29tYmluZUZ1bmMoX21lZGlhW2kgKyAxXSwgZnVuYyk7XG5cdCAgICAgICAgICAgIF9tZWRpYVtpICsgMl0gPSBfY29tYmluZUZ1bmMoX21lZGlhW2kgKyAyXSwgcmVzdWx0KTtcblx0ICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgIGkgPSBfbWVkaWEubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIF9tZWRpYS5wdXNoKHAsIGZ1bmMsIHJlc3VsdCk7XG5cblx0ICAgICAgICAgICAgbXEuYWRkTGlzdGVuZXIgPyBtcS5hZGRMaXN0ZW5lcihfb25NZWRpYUNoYW5nZSkgOiBtcS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIF9vbk1lZGlhQ2hhbmdlKTtcblx0ICAgICAgICAgIH1cblxuXHQgICAgICAgICAgX21lZGlhW2kgKyAzXSA9IG1xLm1hdGNoZXM7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgX2NyZWF0aW5nTWVkaWEgPSAwO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gX21lZGlhO1xuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLmNsZWFyTWF0Y2hNZWRpYSA9IGZ1bmN0aW9uIGNsZWFyTWF0Y2hNZWRpYShxdWVyeSkge1xuXHQgICAgcXVlcnkgfHwgKF9tZWRpYS5sZW5ndGggPSAwKTtcblx0ICAgIHF1ZXJ5ID0gX21lZGlhLmluZGV4T2YocXVlcnkpO1xuXHQgICAgcXVlcnkgPj0gMCAmJiBfbWVkaWEuc3BsaWNlKHF1ZXJ5LCA0KTtcblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5pc0luVmlld3BvcnQgPSBmdW5jdGlvbiBpc0luVmlld3BvcnQoZWxlbWVudCwgcmF0aW8sIGhvcml6b250YWwpIHtcblx0ICAgIHZhciBib3VuZHMgPSAoX2lzU3RyaW5nKGVsZW1lbnQpID8gX2dldFRhcmdldChlbGVtZW50KSA6IGVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuXHQgICAgICAgIG9mZnNldCA9IGJvdW5kc1tob3Jpem9udGFsID8gX3dpZHRoIDogX2hlaWdodF0gKiByYXRpbyB8fCAwO1xuXHQgICAgcmV0dXJuIGhvcml6b250YWwgPyBib3VuZHMucmlnaHQgLSBvZmZzZXQgPiAwICYmIGJvdW5kcy5sZWZ0ICsgb2Zmc2V0IDwgX3dpbi5pbm5lcldpZHRoIDogYm91bmRzLmJvdHRvbSAtIG9mZnNldCA+IDAgJiYgYm91bmRzLnRvcCArIG9mZnNldCA8IF93aW4uaW5uZXJIZWlnaHQ7XG5cdCAgfTtcblxuXHQgIFNjcm9sbFRyaWdnZXIucG9zaXRpb25JblZpZXdwb3J0ID0gZnVuY3Rpb24gcG9zaXRpb25JblZpZXdwb3J0KGVsZW1lbnQsIHJlZmVyZW5jZVBvaW50LCBob3Jpem9udGFsKSB7XG5cdCAgICBfaXNTdHJpbmcoZWxlbWVudCkgJiYgKGVsZW1lbnQgPSBfZ2V0VGFyZ2V0KGVsZW1lbnQpKTtcblx0ICAgIHZhciBib3VuZHMgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuXHQgICAgICAgIHNpemUgPSBib3VuZHNbaG9yaXpvbnRhbCA/IF93aWR0aCA6IF9oZWlnaHRdLFxuXHQgICAgICAgIG9mZnNldCA9IHJlZmVyZW5jZVBvaW50ID09IG51bGwgPyBzaXplIC8gMiA6IHJlZmVyZW5jZVBvaW50IGluIF9rZXl3b3JkcyA/IF9rZXl3b3Jkc1tyZWZlcmVuY2VQb2ludF0gKiBzaXplIDogfnJlZmVyZW5jZVBvaW50LmluZGV4T2YoXCIlXCIpID8gcGFyc2VGbG9hdChyZWZlcmVuY2VQb2ludCkgKiBzaXplIC8gMTAwIDogcGFyc2VGbG9hdChyZWZlcmVuY2VQb2ludCkgfHwgMDtcblx0ICAgIHJldHVybiBob3Jpem9udGFsID8gKGJvdW5kcy5sZWZ0ICsgb2Zmc2V0KSAvIF93aW4uaW5uZXJXaWR0aCA6IChib3VuZHMudG9wICsgb2Zmc2V0KSAvIF93aW4uaW5uZXJIZWlnaHQ7XG5cdCAgfTtcblxuXHQgIHJldHVybiBTY3JvbGxUcmlnZ2VyO1xuXHR9KCk7XG5cdFNjcm9sbFRyaWdnZXIudmVyc2lvbiA9IFwiMy45LjFcIjtcblxuXHRTY3JvbGxUcmlnZ2VyLnNhdmVTdHlsZXMgPSBmdW5jdGlvbiAodGFyZ2V0cykge1xuXHQgIHJldHVybiB0YXJnZXRzID8gX3RvQXJyYXkodGFyZ2V0cykuZm9yRWFjaChmdW5jdGlvbiAodGFyZ2V0KSB7XG5cdCAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5zdHlsZSkge1xuXHQgICAgICB2YXIgaSA9IF9zYXZlZFN0eWxlcy5pbmRleE9mKHRhcmdldCk7XG5cblx0ICAgICAgaSA+PSAwICYmIF9zYXZlZFN0eWxlcy5zcGxpY2UoaSwgNSk7XG5cblx0ICAgICAgX3NhdmVkU3R5bGVzLnB1c2godGFyZ2V0LCB0YXJnZXQuc3R5bGUuY3NzVGV4dCwgdGFyZ2V0LmdldEJCb3ggJiYgdGFyZ2V0LmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKSwgZ3NhcC5jb3JlLmdldENhY2hlKHRhcmdldCksIF9jcmVhdGluZ01lZGlhKTtcblx0ICAgIH1cblx0ICB9KSA6IF9zYXZlZFN0eWxlcztcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLnJldmVydCA9IGZ1bmN0aW9uIChzb2Z0LCBtZWRpYSkge1xuXHQgIHJldHVybiBfcmV2ZXJ0QWxsKCFzb2Z0LCBtZWRpYSk7XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5jcmVhdGUgPSBmdW5jdGlvbiAodmFycywgYW5pbWF0aW9uKSB7XG5cdCAgcmV0dXJuIG5ldyBTY3JvbGxUcmlnZ2VyKHZhcnMsIGFuaW1hdGlvbik7XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5yZWZyZXNoID0gZnVuY3Rpb24gKHNhZmUpIHtcblx0ICByZXR1cm4gc2FmZSA/IF9vblJlc2l6ZSgpIDogKF9jb3JlSW5pdHRlZCB8fCBTY3JvbGxUcmlnZ2VyLnJlZ2lzdGVyKCkpICYmIF9yZWZyZXNoQWxsKHRydWUpO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIudXBkYXRlID0gX3VwZGF0ZUFsbDtcblx0U2Nyb2xsVHJpZ2dlci5jbGVhclNjcm9sbE1lbW9yeSA9IF9jbGVhclNjcm9sbE1lbW9yeTtcblxuXHRTY3JvbGxUcmlnZ2VyLm1heFNjcm9sbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBob3Jpem9udGFsKSB7XG5cdCAgcmV0dXJuIF9tYXhTY3JvbGwoZWxlbWVudCwgaG9yaXpvbnRhbCA/IF9ob3Jpem9udGFsIDogX3ZlcnRpY2FsKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLmdldFNjcm9sbEZ1bmMgPSBmdW5jdGlvbiAoZWxlbWVudCwgaG9yaXpvbnRhbCkge1xuXHQgIHJldHVybiBfZ2V0U2Nyb2xsRnVuYyhfZ2V0VGFyZ2V0KGVsZW1lbnQpLCBob3Jpem9udGFsID8gX2hvcml6b250YWwgOiBfdmVydGljYWwpO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuZ2V0QnlJZCA9IGZ1bmN0aW9uIChpZCkge1xuXHQgIHJldHVybiBfaWRzW2lkXTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLmdldEFsbCA9IGZ1bmN0aW9uICgpIHtcblx0ICByZXR1cm4gX3RyaWdnZXJzLnNsaWNlKDApO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuaXNTY3JvbGxpbmcgPSBmdW5jdGlvbiAoKSB7XG5cdCAgcmV0dXJuICEhX2xhc3RTY3JvbGxUaW1lO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuc25hcERpcmVjdGlvbmFsID0gX3NuYXBEaXJlY3Rpb25hbDtcblxuXHRTY3JvbGxUcmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAodHlwZSwgY2FsbGJhY2spIHtcblx0ICB2YXIgYSA9IF9saXN0ZW5lcnNbdHlwZV0gfHwgKF9saXN0ZW5lcnNbdHlwZV0gPSBbXSk7XG5cdCAgfmEuaW5kZXhPZihjYWxsYmFjaykgfHwgYS5wdXNoKGNhbGxiYWNrKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAodHlwZSwgY2FsbGJhY2spIHtcblx0ICB2YXIgYSA9IF9saXN0ZW5lcnNbdHlwZV0sXG5cdCAgICAgIGkgPSBhICYmIGEuaW5kZXhPZihjYWxsYmFjayk7XG5cdCAgaSA+PSAwICYmIGEuc3BsaWNlKGksIDEpO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuYmF0Y2ggPSBmdW5jdGlvbiAodGFyZ2V0cywgdmFycykge1xuXHQgIHZhciByZXN1bHQgPSBbXSxcblx0ICAgICAgdmFyc0NvcHkgPSB7fSxcblx0ICAgICAgaW50ZXJ2YWwgPSB2YXJzLmludGVydmFsIHx8IDAuMDE2LFxuXHQgICAgICBiYXRjaE1heCA9IHZhcnMuYmF0Y2hNYXggfHwgMWU5LFxuXHQgICAgICBwcm94eUNhbGxiYWNrID0gZnVuY3Rpb24gcHJveHlDYWxsYmFjayh0eXBlLCBjYWxsYmFjaykge1xuXHQgICAgdmFyIGVsZW1lbnRzID0gW10sXG5cdCAgICAgICAgdHJpZ2dlcnMgPSBbXSxcblx0ICAgICAgICBkZWxheSA9IGdzYXAuZGVsYXllZENhbGwoaW50ZXJ2YWwsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgY2FsbGJhY2soZWxlbWVudHMsIHRyaWdnZXJzKTtcblx0ICAgICAgZWxlbWVudHMgPSBbXTtcblx0ICAgICAgdHJpZ2dlcnMgPSBbXTtcblx0ICAgIH0pLnBhdXNlKCk7XG5cdCAgICByZXR1cm4gZnVuY3Rpb24gKHNlbGYpIHtcblx0ICAgICAgZWxlbWVudHMubGVuZ3RoIHx8IGRlbGF5LnJlc3RhcnQodHJ1ZSk7XG5cdCAgICAgIGVsZW1lbnRzLnB1c2goc2VsZi50cmlnZ2VyKTtcblx0ICAgICAgdHJpZ2dlcnMucHVzaChzZWxmKTtcblx0ICAgICAgYmF0Y2hNYXggPD0gZWxlbWVudHMubGVuZ3RoICYmIGRlbGF5LnByb2dyZXNzKDEpO1xuXHQgICAgfTtcblx0ICB9LFxuXHQgICAgICBwO1xuXG5cdCAgZm9yIChwIGluIHZhcnMpIHtcblx0ICAgIHZhcnNDb3B5W3BdID0gcC5zdWJzdHIoMCwgMikgPT09IFwib25cIiAmJiBfaXNGdW5jdGlvbih2YXJzW3BdKSAmJiBwICE9PSBcIm9uUmVmcmVzaEluaXRcIiA/IHByb3h5Q2FsbGJhY2socCwgdmFyc1twXSkgOiB2YXJzW3BdO1xuXHQgIH1cblxuXHQgIGlmIChfaXNGdW5jdGlvbihiYXRjaE1heCkpIHtcblx0ICAgIGJhdGNoTWF4ID0gYmF0Y2hNYXgoKTtcblxuXHQgICAgX2FkZExpc3RlbmVyKFNjcm9sbFRyaWdnZXIsIFwicmVmcmVzaFwiLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIHJldHVybiBiYXRjaE1heCA9IHZhcnMuYmF0Y2hNYXgoKTtcblx0ICAgIH0pO1xuXHQgIH1cblxuXHQgIF90b0FycmF5KHRhcmdldHMpLmZvckVhY2goZnVuY3Rpb24gKHRhcmdldCkge1xuXHQgICAgdmFyIGNvbmZpZyA9IHt9O1xuXG5cdCAgICBmb3IgKHAgaW4gdmFyc0NvcHkpIHtcblx0ICAgICAgY29uZmlnW3BdID0gdmFyc0NvcHlbcF07XG5cdCAgICB9XG5cblx0ICAgIGNvbmZpZy50cmlnZ2VyID0gdGFyZ2V0O1xuXHQgICAgcmVzdWx0LnB1c2goU2Nyb2xsVHJpZ2dlci5jcmVhdGUoY29uZmlnKSk7XG5cdCAgfSk7XG5cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuc29ydCA9IGZ1bmN0aW9uIChmdW5jKSB7XG5cdCAgcmV0dXJuIF90cmlnZ2Vycy5zb3J0KGZ1bmMgfHwgZnVuY3Rpb24gKGEsIGIpIHtcblx0ICAgIHJldHVybiAoYS52YXJzLnJlZnJlc2hQcmlvcml0eSB8fCAwKSAqIC0xZTYgKyBhLnN0YXJ0IC0gKGIuc3RhcnQgKyAoYi52YXJzLnJlZnJlc2hQcmlvcml0eSB8fCAwKSAqIC0xZTYpO1xuXHQgIH0pO1xuXHR9O1xuXG5cdF9nZXRHU0FQKCkgJiYgZ3NhcC5yZWdpc3RlclBsdWdpbihTY3JvbGxUcmlnZ2VyKTtcblxuXHRleHBvcnRzLlNjcm9sbFRyaWdnZXIgPSBTY3JvbGxUcmlnZ2VyO1xuXHRleHBvcnRzLmRlZmF1bHQgPSBTY3JvbGxUcmlnZ2VyO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwud2luZG93ID0gZ2xvYmFsLndpbmRvdyB8fCB7fSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gICAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7XG4gICAgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7XG4gICAgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbiAgfVxuXG4gIGZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICAgIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qIVxuICAgKiBHU0FQIDMuOS4xXG4gICAqIGh0dHBzOi8vZ3JlZW5zb2NrLmNvbVxuICAgKlxuICAgKiBAbGljZW5zZSBDb3B5cmlnaHQgMjAwOC0yMDIxLCBHcmVlblNvY2suIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAqIFN1YmplY3QgdG8gdGhlIHRlcm1zIGF0IGh0dHBzOi8vZ3JlZW5zb2NrLmNvbS9zdGFuZGFyZC1saWNlbnNlIG9yIGZvclxuICAgKiBDbHViIEdyZWVuU29jayBtZW1iZXJzLCB0aGUgYWdyZWVtZW50IGlzc3VlZCB3aXRoIHRoYXQgbWVtYmVyc2hpcC5cbiAgICogQGF1dGhvcjogSmFjayBEb3lsZSwgamFja0BncmVlbnNvY2suY29tXG4gICovXG4gIHZhciBfY29uZmlnID0ge1xuICAgIGF1dG9TbGVlcDogMTIwLFxuICAgIGZvcmNlM0Q6IFwiYXV0b1wiLFxuICAgIG51bGxUYXJnZXRXYXJuOiAxLFxuICAgIHVuaXRzOiB7XG4gICAgICBsaW5lSGVpZ2h0OiBcIlwiXG4gICAgfVxuICB9LFxuICAgICAgX2RlZmF1bHRzID0ge1xuICAgIGR1cmF0aW9uOiAuNSxcbiAgICBvdmVyd3JpdGU6IGZhbHNlLFxuICAgIGRlbGF5OiAwXG4gIH0sXG4gICAgICBfc3VwcHJlc3NPdmVyd3JpdGVzLFxuICAgICAgX2JpZ051bSA9IDFlOCxcbiAgICAgIF90aW55TnVtID0gMSAvIF9iaWdOdW0sXG4gICAgICBfMlBJID0gTWF0aC5QSSAqIDIsXG4gICAgICBfSEFMRl9QSSA9IF8yUEkgLyA0LFxuICAgICAgX2dzSUQgPSAwLFxuICAgICAgX3NxcnQgPSBNYXRoLnNxcnQsXG4gICAgICBfY29zID0gTWF0aC5jb3MsXG4gICAgICBfc2luID0gTWF0aC5zaW4sXG4gICAgICBfaXNTdHJpbmcgPSBmdW5jdGlvbiBfaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiO1xuICB9LFxuICAgICAgX2lzRnVuY3Rpb24gPSBmdW5jdGlvbiBfaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIjtcbiAgfSxcbiAgICAgIF9pc051bWJlciA9IGZ1bmN0aW9uIF9pc051bWJlcih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCI7XG4gIH0sXG4gICAgICBfaXNVbmRlZmluZWQgPSBmdW5jdGlvbiBfaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiO1xuICB9LFxuICAgICAgX2lzT2JqZWN0ID0gZnVuY3Rpb24gX2lzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIjtcbiAgfSxcbiAgICAgIF9pc05vdEZhbHNlID0gZnVuY3Rpb24gX2lzTm90RmFsc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IGZhbHNlO1xuICB9LFxuICAgICAgX3dpbmRvd0V4aXN0cyA9IGZ1bmN0aW9uIF93aW5kb3dFeGlzdHMoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI7XG4gIH0sXG4gICAgICBfaXNGdW5jT3JTdHJpbmcgPSBmdW5jdGlvbiBfaXNGdW5jT3JTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gX2lzRnVuY3Rpb24odmFsdWUpIHx8IF9pc1N0cmluZyh2YWx1ZSk7XG4gIH0sXG4gICAgICBfaXNUeXBlZEFycmF5ID0gdHlwZW9mIEFycmF5QnVmZmVyID09PSBcImZ1bmN0aW9uXCIgJiYgQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5LFxuICAgICAgX3N0cmljdE51bUV4cCA9IC8oPzotP1xcLj9cXGR8XFwuKSsvZ2ksXG4gICAgICBfbnVtRXhwID0gL1stKz0uXSpcXGQrWy5lXFwtK10qXFxkKltlXFwtK10qXFxkKi9nLFxuICAgICAgX251bVdpdGhVbml0RXhwID0gL1stKz0uXSpcXGQrWy5lLV0qXFxkKlthLXolXSovZyxcbiAgICAgIF9jb21wbGV4U3RyaW5nTnVtRXhwID0gL1stKz0uXSpcXGQrXFwuP1xcZCooPzplLXxlXFwrKT9cXGQqL2dpLFxuICAgICAgX3JlbEV4cCA9IC9bKy1dPS0/Wy5cXGRdKy8sXG4gICAgICBfZGVsaW1pdGVkVmFsdWVFeHAgPSAvW14sJ1wiXFxbXFxdXFxzXSsvZ2ksXG4gICAgICBfdW5pdEV4cCA9IC9bXFxkLitcXC09XSsoPzplWy0rXVxcZCopKi9pLFxuICAgICAgX2dsb2JhbFRpbWVsaW5lLFxuICAgICAgX3dpbixcbiAgICAgIF9jb3JlSW5pdHRlZCxcbiAgICAgIF9kb2MsXG4gICAgICBfZ2xvYmFscyA9IHt9LFxuICAgICAgX2luc3RhbGxTY29wZSA9IHt9LFxuICAgICAgX2NvcmVSZWFkeSxcbiAgICAgIF9pbnN0YWxsID0gZnVuY3Rpb24gX2luc3RhbGwoc2NvcGUpIHtcbiAgICByZXR1cm4gKF9pbnN0YWxsU2NvcGUgPSBfbWVyZ2Uoc2NvcGUsIF9nbG9iYWxzKSkgJiYgZ3NhcDtcbiAgfSxcbiAgICAgIF9taXNzaW5nUGx1Z2luID0gZnVuY3Rpb24gX21pc3NpbmdQbHVnaW4ocHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUud2FybihcIkludmFsaWQgcHJvcGVydHlcIiwgcHJvcGVydHksIFwic2V0IHRvXCIsIHZhbHVlLCBcIk1pc3NpbmcgcGx1Z2luPyBnc2FwLnJlZ2lzdGVyUGx1Z2luKClcIik7XG4gIH0sXG4gICAgICBfd2FybiA9IGZ1bmN0aW9uIF93YXJuKG1lc3NhZ2UsIHN1cHByZXNzKSB7XG4gICAgcmV0dXJuICFzdXBwcmVzcyAmJiBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gIH0sXG4gICAgICBfYWRkR2xvYmFsID0gZnVuY3Rpb24gX2FkZEdsb2JhbChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gbmFtZSAmJiAoX2dsb2JhbHNbbmFtZV0gPSBvYmopICYmIF9pbnN0YWxsU2NvcGUgJiYgKF9pbnN0YWxsU2NvcGVbbmFtZV0gPSBvYmopIHx8IF9nbG9iYWxzO1xuICB9LFxuICAgICAgX2VtcHR5RnVuYyA9IGZ1bmN0aW9uIF9lbXB0eUZ1bmMoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0sXG4gICAgICBfcmVzZXJ2ZWRQcm9wcyA9IHt9LFxuICAgICAgX2xhenlUd2VlbnMgPSBbXSxcbiAgICAgIF9sYXp5TG9va3VwID0ge30sXG4gICAgICBfbGFzdFJlbmRlcmVkRnJhbWUsXG4gICAgICBfcGx1Z2lucyA9IHt9LFxuICAgICAgX2VmZmVjdHMgPSB7fSxcbiAgICAgIF9uZXh0R0NGcmFtZSA9IDMwLFxuICAgICAgX2hhcm5lc3NQbHVnaW5zID0gW10sXG4gICAgICBfY2FsbGJhY2tOYW1lcyA9IFwiXCIsXG4gICAgICBfaGFybmVzcyA9IGZ1bmN0aW9uIF9oYXJuZXNzKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1swXSxcbiAgICAgICAgaGFybmVzc1BsdWdpbixcbiAgICAgICAgaTtcbiAgICBfaXNPYmplY3QodGFyZ2V0KSB8fCBfaXNGdW5jdGlvbih0YXJnZXQpIHx8ICh0YXJnZXRzID0gW3RhcmdldHNdKTtcblxuICAgIGlmICghKGhhcm5lc3NQbHVnaW4gPSAodGFyZ2V0Ll9nc2FwIHx8IHt9KS5oYXJuZXNzKSkge1xuICAgICAgaSA9IF9oYXJuZXNzUGx1Z2lucy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpLS0gJiYgIV9oYXJuZXNzUGx1Z2luc1tpXS50YXJnZXRUZXN0KHRhcmdldCkpIHt9XG5cbiAgICAgIGhhcm5lc3NQbHVnaW4gPSBfaGFybmVzc1BsdWdpbnNbaV07XG4gICAgfVxuXG4gICAgaSA9IHRhcmdldHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdGFyZ2V0c1tpXSAmJiAodGFyZ2V0c1tpXS5fZ3NhcCB8fCAodGFyZ2V0c1tpXS5fZ3NhcCA9IG5ldyBHU0NhY2hlKHRhcmdldHNbaV0sIGhhcm5lc3NQbHVnaW4pKSkgfHwgdGFyZ2V0cy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldHM7XG4gIH0sXG4gICAgICBfZ2V0Q2FjaGUgPSBmdW5jdGlvbiBfZ2V0Q2FjaGUodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5fZ3NhcCB8fCBfaGFybmVzcyh0b0FycmF5KHRhcmdldCkpWzBdLl9nc2FwO1xuICB9LFxuICAgICAgX2dldFByb3BlcnR5ID0gZnVuY3Rpb24gX2dldFByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIHYpIHtcbiAgICByZXR1cm4gKHYgPSB0YXJnZXRbcHJvcGVydHldKSAmJiBfaXNGdW5jdGlvbih2KSA/IHRhcmdldFtwcm9wZXJ0eV0oKSA6IF9pc1VuZGVmaW5lZCh2KSAmJiB0YXJnZXQuZ2V0QXR0cmlidXRlICYmIHRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcGVydHkpIHx8IHY7XG4gIH0sXG4gICAgICBfZm9yRWFjaE5hbWUgPSBmdW5jdGlvbiBfZm9yRWFjaE5hbWUobmFtZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gKG5hbWVzID0gbmFtZXMuc3BsaXQoXCIsXCIpKS5mb3JFYWNoKGZ1bmMpIHx8IG5hbWVzO1xuICB9LFxuICAgICAgX3JvdW5kID0gZnVuY3Rpb24gX3JvdW5kKHZhbHVlKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAxMDAwMDApIC8gMTAwMDAwIHx8IDA7XG4gIH0sXG4gICAgICBfcm91bmRQcmVjaXNlID0gZnVuY3Rpb24gX3JvdW5kUHJlY2lzZSh2YWx1ZSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogMTAwMDAwMDApIC8gMTAwMDAwMDAgfHwgMDtcbiAgfSxcbiAgICAgIF9hcnJheUNvbnRhaW5zQW55ID0gZnVuY3Rpb24gX2FycmF5Q29udGFpbnNBbnkodG9TZWFyY2gsIHRvRmluZCkge1xuICAgIHZhciBsID0gdG9GaW5kLmxlbmd0aCxcbiAgICAgICAgaSA9IDA7XG5cbiAgICBmb3IgKDsgdG9TZWFyY2guaW5kZXhPZih0b0ZpbmRbaV0pIDwgMCAmJiArK2kgPCBsOykge31cblxuICAgIHJldHVybiBpIDwgbDtcbiAgfSxcbiAgICAgIF9sYXp5UmVuZGVyID0gZnVuY3Rpb24gX2xhenlSZW5kZXIoKSB7XG4gICAgdmFyIGwgPSBfbGF6eVR3ZWVucy5sZW5ndGgsXG4gICAgICAgIGEgPSBfbGF6eVR3ZWVucy5zbGljZSgwKSxcbiAgICAgICAgaSxcbiAgICAgICAgdHdlZW47XG5cbiAgICBfbGF6eUxvb2t1cCA9IHt9O1xuICAgIF9sYXp5VHdlZW5zLmxlbmd0aCA9IDA7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0d2VlbiA9IGFbaV07XG4gICAgICB0d2VlbiAmJiB0d2Vlbi5fbGF6eSAmJiAodHdlZW4ucmVuZGVyKHR3ZWVuLl9sYXp5WzBdLCB0d2Vlbi5fbGF6eVsxXSwgdHJ1ZSkuX2xhenkgPSAwKTtcbiAgICB9XG4gIH0sXG4gICAgICBfbGF6eVNhZmVSZW5kZXIgPSBmdW5jdGlvbiBfbGF6eVNhZmVSZW5kZXIoYW5pbWF0aW9uLCB0aW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpIHtcbiAgICBfbGF6eVR3ZWVucy5sZW5ndGggJiYgX2xhenlSZW5kZXIoKTtcbiAgICBhbmltYXRpb24ucmVuZGVyKHRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgX2xhenlUd2VlbnMubGVuZ3RoICYmIF9sYXp5UmVuZGVyKCk7XG4gIH0sXG4gICAgICBfbnVtZXJpY0lmUG9zc2libGUgPSBmdW5jdGlvbiBfbnVtZXJpY0lmUG9zc2libGUodmFsdWUpIHtcbiAgICB2YXIgbiA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIHJldHVybiAobiB8fCBuID09PSAwKSAmJiAodmFsdWUgKyBcIlwiKS5tYXRjaChfZGVsaW1pdGVkVmFsdWVFeHApLmxlbmd0aCA8IDIgPyBuIDogX2lzU3RyaW5nKHZhbHVlKSA/IHZhbHVlLnRyaW0oKSA6IHZhbHVlO1xuICB9LFxuICAgICAgX3Bhc3NUaHJvdWdoID0gZnVuY3Rpb24gX3Bhc3NUaHJvdWdoKHApIHtcbiAgICByZXR1cm4gcDtcbiAgfSxcbiAgICAgIF9zZXREZWZhdWx0cyA9IGZ1bmN0aW9uIF9zZXREZWZhdWx0cyhvYmosIGRlZmF1bHRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBkZWZhdWx0cykge1xuICAgICAgcCBpbiBvYmogfHwgKG9ialtwXSA9IGRlZmF1bHRzW3BdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICAgICAgX3NldEtleWZyYW1lRGVmYXVsdHMgPSBmdW5jdGlvbiBfc2V0S2V5ZnJhbWVEZWZhdWx0cyhleGNsdWRlRHVyYXRpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgZGVmYXVsdHMpIHtcbiAgICAgIGZvciAodmFyIHAgaW4gZGVmYXVsdHMpIHtcbiAgICAgICAgcCBpbiBvYmogfHwgcCA9PT0gXCJkdXJhdGlvblwiICYmIGV4Y2x1ZGVEdXJhdGlvbiB8fCBwID09PSBcImVhc2VcIiB8fCAob2JqW3BdID0gZGVmYXVsdHNbcF0pO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gICAgICBfbWVyZ2UgPSBmdW5jdGlvbiBfbWVyZ2UoYmFzZSwgdG9NZXJnZSkge1xuICAgIGZvciAodmFyIHAgaW4gdG9NZXJnZSkge1xuICAgICAgYmFzZVtwXSA9IHRvTWVyZ2VbcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2U7XG4gIH0sXG4gICAgICBfbWVyZ2VEZWVwID0gZnVuY3Rpb24gX21lcmdlRGVlcChiYXNlLCB0b01lcmdlKSB7XG4gICAgZm9yICh2YXIgcCBpbiB0b01lcmdlKSB7XG4gICAgICBwICE9PSBcIl9fcHJvdG9fX1wiICYmIHAgIT09IFwiY29uc3RydWN0b3JcIiAmJiBwICE9PSBcInByb3RvdHlwZVwiICYmIChiYXNlW3BdID0gX2lzT2JqZWN0KHRvTWVyZ2VbcF0pID8gX21lcmdlRGVlcChiYXNlW3BdIHx8IChiYXNlW3BdID0ge30pLCB0b01lcmdlW3BdKSA6IHRvTWVyZ2VbcF0pO1xuICAgIH1cblxuICAgIHJldHVybiBiYXNlO1xuICB9LFxuICAgICAgX2NvcHlFeGNsdWRpbmcgPSBmdW5jdGlvbiBfY29weUV4Y2x1ZGluZyhvYmosIGV4Y2x1ZGluZykge1xuICAgIHZhciBjb3B5ID0ge30sXG4gICAgICAgIHA7XG5cbiAgICBmb3IgKHAgaW4gb2JqKSB7XG4gICAgICBwIGluIGV4Y2x1ZGluZyB8fCAoY29weVtwXSA9IG9ialtwXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvcHk7XG4gIH0sXG4gICAgICBfaW5oZXJpdERlZmF1bHRzID0gZnVuY3Rpb24gX2luaGVyaXREZWZhdWx0cyh2YXJzKSB7XG4gICAgdmFyIHBhcmVudCA9IHZhcnMucGFyZW50IHx8IF9nbG9iYWxUaW1lbGluZSxcbiAgICAgICAgZnVuYyA9IHZhcnMua2V5ZnJhbWVzID8gX3NldEtleWZyYW1lRGVmYXVsdHMoX2lzQXJyYXkodmFycy5rZXlmcmFtZXMpKSA6IF9zZXREZWZhdWx0cztcblxuICAgIGlmIChfaXNOb3RGYWxzZSh2YXJzLmluaGVyaXQpKSB7XG4gICAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICAgIGZ1bmModmFycywgcGFyZW50LnZhcnMuZGVmYXVsdHMpO1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50IHx8IHBhcmVudC5fZHA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhcnM7XG4gIH0sXG4gICAgICBfYXJyYXlzTWF0Y2ggPSBmdW5jdGlvbiBfYXJyYXlzTWF0Y2goYTEsIGEyKSB7XG4gICAgdmFyIGkgPSBhMS5sZW5ndGgsXG4gICAgICAgIG1hdGNoID0gaSA9PT0gYTIubGVuZ3RoO1xuXG4gICAgd2hpbGUgKG1hdGNoICYmIGktLSAmJiBhMVtpXSA9PT0gYTJbaV0pIHt9XG5cbiAgICByZXR1cm4gaSA8IDA7XG4gIH0sXG4gICAgICBfYWRkTGlua2VkTGlzdEl0ZW0gPSBmdW5jdGlvbiBfYWRkTGlua2VkTGlzdEl0ZW0ocGFyZW50LCBjaGlsZCwgZmlyc3RQcm9wLCBsYXN0UHJvcCwgc29ydEJ5KSB7XG4gICAgaWYgKGZpcnN0UHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICBmaXJzdFByb3AgPSBcIl9maXJzdFwiO1xuICAgIH1cblxuICAgIGlmIChsYXN0UHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICBsYXN0UHJvcCA9IFwiX2xhc3RcIjtcbiAgICB9XG5cbiAgICB2YXIgcHJldiA9IHBhcmVudFtsYXN0UHJvcF0sXG4gICAgICAgIHQ7XG5cbiAgICBpZiAoc29ydEJ5KSB7XG4gICAgICB0ID0gY2hpbGRbc29ydEJ5XTtcblxuICAgICAgd2hpbGUgKHByZXYgJiYgcHJldltzb3J0QnldID4gdCkge1xuICAgICAgICBwcmV2ID0gcHJldi5fcHJldjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJldikge1xuICAgICAgY2hpbGQuX25leHQgPSBwcmV2Ll9uZXh0O1xuICAgICAgcHJldi5fbmV4dCA9IGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZC5fbmV4dCA9IHBhcmVudFtmaXJzdFByb3BdO1xuICAgICAgcGFyZW50W2ZpcnN0UHJvcF0gPSBjaGlsZDtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGQuX25leHQpIHtcbiAgICAgIGNoaWxkLl9uZXh0Ll9wcmV2ID0gY2hpbGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudFtsYXN0UHJvcF0gPSBjaGlsZDtcbiAgICB9XG5cbiAgICBjaGlsZC5fcHJldiA9IHByZXY7XG4gICAgY2hpbGQucGFyZW50ID0gY2hpbGQuX2RwID0gcGFyZW50O1xuICAgIHJldHVybiBjaGlsZDtcbiAgfSxcbiAgICAgIF9yZW1vdmVMaW5rZWRMaXN0SXRlbSA9IGZ1bmN0aW9uIF9yZW1vdmVMaW5rZWRMaXN0SXRlbShwYXJlbnQsIGNoaWxkLCBmaXJzdFByb3AsIGxhc3RQcm9wKSB7XG4gICAgaWYgKGZpcnN0UHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICBmaXJzdFByb3AgPSBcIl9maXJzdFwiO1xuICAgIH1cblxuICAgIGlmIChsYXN0UHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICBsYXN0UHJvcCA9IFwiX2xhc3RcIjtcbiAgICB9XG5cbiAgICB2YXIgcHJldiA9IGNoaWxkLl9wcmV2LFxuICAgICAgICBuZXh0ID0gY2hpbGQuX25leHQ7XG5cbiAgICBpZiAocHJldikge1xuICAgICAgcHJldi5fbmV4dCA9IG5leHQ7XG4gICAgfSBlbHNlIGlmIChwYXJlbnRbZmlyc3RQcm9wXSA9PT0gY2hpbGQpIHtcbiAgICAgIHBhcmVudFtmaXJzdFByb3BdID0gbmV4dDtcbiAgICB9XG5cbiAgICBpZiAobmV4dCkge1xuICAgICAgbmV4dC5fcHJldiA9IHByZXY7XG4gICAgfSBlbHNlIGlmIChwYXJlbnRbbGFzdFByb3BdID09PSBjaGlsZCkge1xuICAgICAgcGFyZW50W2xhc3RQcm9wXSA9IHByZXY7XG4gICAgfVxuXG4gICAgY2hpbGQuX25leHQgPSBjaGlsZC5fcHJldiA9IGNoaWxkLnBhcmVudCA9IG51bGw7XG4gIH0sXG4gICAgICBfcmVtb3ZlRnJvbVBhcmVudCA9IGZ1bmN0aW9uIF9yZW1vdmVGcm9tUGFyZW50KGNoaWxkLCBvbmx5SWZQYXJlbnRIYXNBdXRvUmVtb3ZlKSB7XG4gICAgY2hpbGQucGFyZW50ICYmICghb25seUlmUGFyZW50SGFzQXV0b1JlbW92ZSB8fCBjaGlsZC5wYXJlbnQuYXV0b1JlbW92ZUNoaWxkcmVuKSAmJiBjaGlsZC5wYXJlbnQucmVtb3ZlKGNoaWxkKTtcbiAgICBjaGlsZC5fYWN0ID0gMDtcbiAgfSxcbiAgICAgIF91bmNhY2hlID0gZnVuY3Rpb24gX3VuY2FjaGUoYW5pbWF0aW9uLCBjaGlsZCkge1xuICAgIGlmIChhbmltYXRpb24gJiYgKCFjaGlsZCB8fCBjaGlsZC5fZW5kID4gYW5pbWF0aW9uLl9kdXIgfHwgY2hpbGQuX3N0YXJ0IDwgMCkpIHtcbiAgICAgIHZhciBhID0gYW5pbWF0aW9uO1xuXG4gICAgICB3aGlsZSAoYSkge1xuICAgICAgICBhLl9kaXJ0eSA9IDE7XG4gICAgICAgIGEgPSBhLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9LFxuICAgICAgX3JlY2FjaGVBbmNlc3RvcnMgPSBmdW5jdGlvbiBfcmVjYWNoZUFuY2VzdG9ycyhhbmltYXRpb24pIHtcbiAgICB2YXIgcGFyZW50ID0gYW5pbWF0aW9uLnBhcmVudDtcblxuICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50LnBhcmVudCkge1xuICAgICAgcGFyZW50Ll9kaXJ0eSA9IDE7XG4gICAgICBwYXJlbnQudG90YWxEdXJhdGlvbigpO1xuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9LFxuICAgICAgX2hhc05vUGF1c2VkQW5jZXN0b3JzID0gZnVuY3Rpb24gX2hhc05vUGF1c2VkQW5jZXN0b3JzKGFuaW1hdGlvbikge1xuICAgIHJldHVybiAhYW5pbWF0aW9uIHx8IGFuaW1hdGlvbi5fdHMgJiYgX2hhc05vUGF1c2VkQW5jZXN0b3JzKGFuaW1hdGlvbi5wYXJlbnQpO1xuICB9LFxuICAgICAgX2VsYXBzZWRDeWNsZUR1cmF0aW9uID0gZnVuY3Rpb24gX2VsYXBzZWRDeWNsZUR1cmF0aW9uKGFuaW1hdGlvbikge1xuICAgIHJldHVybiBhbmltYXRpb24uX3JlcGVhdCA/IF9hbmltYXRpb25DeWNsZShhbmltYXRpb24uX3RUaW1lLCBhbmltYXRpb24gPSBhbmltYXRpb24uZHVyYXRpb24oKSArIGFuaW1hdGlvbi5fckRlbGF5KSAqIGFuaW1hdGlvbiA6IDA7XG4gIH0sXG4gICAgICBfYW5pbWF0aW9uQ3ljbGUgPSBmdW5jdGlvbiBfYW5pbWF0aW9uQ3ljbGUodFRpbWUsIGN5Y2xlRHVyYXRpb24pIHtcbiAgICB2YXIgd2hvbGUgPSBNYXRoLmZsb29yKHRUaW1lIC89IGN5Y2xlRHVyYXRpb24pO1xuICAgIHJldHVybiB0VGltZSAmJiB3aG9sZSA9PT0gdFRpbWUgPyB3aG9sZSAtIDEgOiB3aG9sZTtcbiAgfSxcbiAgICAgIF9wYXJlbnRUb0NoaWxkVG90YWxUaW1lID0gZnVuY3Rpb24gX3BhcmVudFRvQ2hpbGRUb3RhbFRpbWUocGFyZW50VGltZSwgY2hpbGQpIHtcbiAgICByZXR1cm4gKHBhcmVudFRpbWUgLSBjaGlsZC5fc3RhcnQpICogY2hpbGQuX3RzICsgKGNoaWxkLl90cyA+PSAwID8gMCA6IGNoaWxkLl9kaXJ0eSA/IGNoaWxkLnRvdGFsRHVyYXRpb24oKSA6IGNoaWxkLl90RHVyKTtcbiAgfSxcbiAgICAgIF9zZXRFbmQgPSBmdW5jdGlvbiBfc2V0RW5kKGFuaW1hdGlvbikge1xuICAgIHJldHVybiBhbmltYXRpb24uX2VuZCA9IF9yb3VuZFByZWNpc2UoYW5pbWF0aW9uLl9zdGFydCArIChhbmltYXRpb24uX3REdXIgLyBNYXRoLmFicyhhbmltYXRpb24uX3RzIHx8IGFuaW1hdGlvbi5fcnRzIHx8IF90aW55TnVtKSB8fCAwKSk7XG4gIH0sXG4gICAgICBfYWxpZ25QbGF5aGVhZCA9IGZ1bmN0aW9uIF9hbGlnblBsYXloZWFkKGFuaW1hdGlvbiwgdG90YWxUaW1lKSB7XG4gICAgdmFyIHBhcmVudCA9IGFuaW1hdGlvbi5fZHA7XG5cbiAgICBpZiAocGFyZW50ICYmIHBhcmVudC5zbW9vdGhDaGlsZFRpbWluZyAmJiBhbmltYXRpb24uX3RzKSB7XG4gICAgICBhbmltYXRpb24uX3N0YXJ0ID0gX3JvdW5kUHJlY2lzZShwYXJlbnQuX3RpbWUgLSAoYW5pbWF0aW9uLl90cyA+IDAgPyB0b3RhbFRpbWUgLyBhbmltYXRpb24uX3RzIDogKChhbmltYXRpb24uX2RpcnR5ID8gYW5pbWF0aW9uLnRvdGFsRHVyYXRpb24oKSA6IGFuaW1hdGlvbi5fdER1cikgLSB0b3RhbFRpbWUpIC8gLWFuaW1hdGlvbi5fdHMpKTtcblxuICAgICAgX3NldEVuZChhbmltYXRpb24pO1xuXG4gICAgICBwYXJlbnQuX2RpcnR5IHx8IF91bmNhY2hlKHBhcmVudCwgYW5pbWF0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9LFxuICAgICAgX3Bvc3RBZGRDaGVja3MgPSBmdW5jdGlvbiBfcG9zdEFkZENoZWNrcyh0aW1lbGluZSwgY2hpbGQpIHtcbiAgICB2YXIgdDtcblxuICAgIGlmIChjaGlsZC5fdGltZSB8fCBjaGlsZC5faW5pdHRlZCAmJiAhY2hpbGQuX2R1cikge1xuICAgICAgdCA9IF9wYXJlbnRUb0NoaWxkVG90YWxUaW1lKHRpbWVsaW5lLnJhd1RpbWUoKSwgY2hpbGQpO1xuXG4gICAgICBpZiAoIWNoaWxkLl9kdXIgfHwgX2NsYW1wKDAsIGNoaWxkLnRvdGFsRHVyYXRpb24oKSwgdCkgLSBjaGlsZC5fdFRpbWUgPiBfdGlueU51bSkge1xuICAgICAgICBjaGlsZC5yZW5kZXIodCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF91bmNhY2hlKHRpbWVsaW5lLCBjaGlsZCkuX2RwICYmIHRpbWVsaW5lLl9pbml0dGVkICYmIHRpbWVsaW5lLl90aW1lID49IHRpbWVsaW5lLl9kdXIgJiYgdGltZWxpbmUuX3RzKSB7XG4gICAgICBpZiAodGltZWxpbmUuX2R1ciA8IHRpbWVsaW5lLmR1cmF0aW9uKCkpIHtcbiAgICAgICAgdCA9IHRpbWVsaW5lO1xuXG4gICAgICAgIHdoaWxlICh0Ll9kcCkge1xuICAgICAgICAgIHQucmF3VGltZSgpID49IDAgJiYgdC50b3RhbFRpbWUodC5fdFRpbWUpO1xuICAgICAgICAgIHQgPSB0Ll9kcDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aW1lbGluZS5felRpbWUgPSAtX3RpbnlOdW07XG4gICAgfVxuICB9LFxuICAgICAgX2FkZFRvVGltZWxpbmUgPSBmdW5jdGlvbiBfYWRkVG9UaW1lbGluZSh0aW1lbGluZSwgY2hpbGQsIHBvc2l0aW9uLCBza2lwQ2hlY2tzKSB7XG4gICAgY2hpbGQucGFyZW50ICYmIF9yZW1vdmVGcm9tUGFyZW50KGNoaWxkKTtcbiAgICBjaGlsZC5fc3RhcnQgPSBfcm91bmRQcmVjaXNlKChfaXNOdW1iZXIocG9zaXRpb24pID8gcG9zaXRpb24gOiBwb3NpdGlvbiB8fCB0aW1lbGluZSAhPT0gX2dsb2JhbFRpbWVsaW5lID8gX3BhcnNlUG9zaXRpb24odGltZWxpbmUsIHBvc2l0aW9uLCBjaGlsZCkgOiB0aW1lbGluZS5fdGltZSkgKyBjaGlsZC5fZGVsYXkpO1xuICAgIGNoaWxkLl9lbmQgPSBfcm91bmRQcmVjaXNlKGNoaWxkLl9zdGFydCArIChjaGlsZC50b3RhbER1cmF0aW9uKCkgLyBNYXRoLmFicyhjaGlsZC50aW1lU2NhbGUoKSkgfHwgMCkpO1xuXG4gICAgX2FkZExpbmtlZExpc3RJdGVtKHRpbWVsaW5lLCBjaGlsZCwgXCJfZmlyc3RcIiwgXCJfbGFzdFwiLCB0aW1lbGluZS5fc29ydCA/IFwiX3N0YXJ0XCIgOiAwKTtcblxuICAgIF9pc0Zyb21PckZyb21TdGFydChjaGlsZCkgfHwgKHRpbWVsaW5lLl9yZWNlbnQgPSBjaGlsZCk7XG4gICAgc2tpcENoZWNrcyB8fCBfcG9zdEFkZENoZWNrcyh0aW1lbGluZSwgY2hpbGQpO1xuICAgIHJldHVybiB0aW1lbGluZTtcbiAgfSxcbiAgICAgIF9zY3JvbGxUcmlnZ2VyID0gZnVuY3Rpb24gX3Njcm9sbFRyaWdnZXIoYW5pbWF0aW9uLCB0cmlnZ2VyKSB7XG4gICAgcmV0dXJuIChfZ2xvYmFscy5TY3JvbGxUcmlnZ2VyIHx8IF9taXNzaW5nUGx1Z2luKFwic2Nyb2xsVHJpZ2dlclwiLCB0cmlnZ2VyKSkgJiYgX2dsb2JhbHMuU2Nyb2xsVHJpZ2dlci5jcmVhdGUodHJpZ2dlciwgYW5pbWF0aW9uKTtcbiAgfSxcbiAgICAgIF9hdHRlbXB0SW5pdFR3ZWVuID0gZnVuY3Rpb24gX2F0dGVtcHRJbml0VHdlZW4odHdlZW4sIHRvdGFsVGltZSwgZm9yY2UsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgX2luaXRUd2Vlbih0d2VlbiwgdG90YWxUaW1lKTtcblxuICAgIGlmICghdHdlZW4uX2luaXR0ZWQpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIGlmICghZm9yY2UgJiYgdHdlZW4uX3B0ICYmICh0d2Vlbi5fZHVyICYmIHR3ZWVuLnZhcnMubGF6eSAhPT0gZmFsc2UgfHwgIXR3ZWVuLl9kdXIgJiYgdHdlZW4udmFycy5sYXp5KSAmJiBfbGFzdFJlbmRlcmVkRnJhbWUgIT09IF90aWNrZXIuZnJhbWUpIHtcbiAgICAgIF9sYXp5VHdlZW5zLnB1c2godHdlZW4pO1xuXG4gICAgICB0d2Vlbi5fbGF6eSA9IFt0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzXTtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgfSxcbiAgICAgIF9wYXJlbnRQbGF5aGVhZElzQmVmb3JlU3RhcnQgPSBmdW5jdGlvbiBfcGFyZW50UGxheWhlYWRJc0JlZm9yZVN0YXJ0KF9yZWYpIHtcbiAgICB2YXIgcGFyZW50ID0gX3JlZi5wYXJlbnQ7XG4gICAgcmV0dXJuIHBhcmVudCAmJiBwYXJlbnQuX3RzICYmIHBhcmVudC5faW5pdHRlZCAmJiAhcGFyZW50Ll9sb2NrICYmIChwYXJlbnQucmF3VGltZSgpIDwgMCB8fCBfcGFyZW50UGxheWhlYWRJc0JlZm9yZVN0YXJ0KHBhcmVudCkpO1xuICB9LFxuICAgICAgX2lzRnJvbU9yRnJvbVN0YXJ0ID0gZnVuY3Rpb24gX2lzRnJvbU9yRnJvbVN0YXJ0KF9yZWYyKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMi5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSBcImlzRnJvbVN0YXJ0XCIgfHwgZGF0YSA9PT0gXCJpc1N0YXJ0XCI7XG4gIH0sXG4gICAgICBfcmVuZGVyWmVyb0R1cmF0aW9uVHdlZW4gPSBmdW5jdGlvbiBfcmVuZGVyWmVyb0R1cmF0aW9uVHdlZW4odHdlZW4sIHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKSB7XG4gICAgdmFyIHByZXZSYXRpbyA9IHR3ZWVuLnJhdGlvLFxuICAgICAgICByYXRpbyA9IHRvdGFsVGltZSA8IDAgfHwgIXRvdGFsVGltZSAmJiAoIXR3ZWVuLl9zdGFydCAmJiBfcGFyZW50UGxheWhlYWRJc0JlZm9yZVN0YXJ0KHR3ZWVuKSAmJiAhKCF0d2Vlbi5faW5pdHRlZCAmJiBfaXNGcm9tT3JGcm9tU3RhcnQodHdlZW4pKSB8fCAodHdlZW4uX3RzIDwgMCB8fCB0d2Vlbi5fZHAuX3RzIDwgMCkgJiYgIV9pc0Zyb21PckZyb21TdGFydCh0d2VlbikpID8gMCA6IDEsXG4gICAgICAgIHJlcGVhdERlbGF5ID0gdHdlZW4uX3JEZWxheSxcbiAgICAgICAgdFRpbWUgPSAwLFxuICAgICAgICBwdCxcbiAgICAgICAgaXRlcmF0aW9uLFxuICAgICAgICBwcmV2SXRlcmF0aW9uO1xuXG4gICAgaWYgKHJlcGVhdERlbGF5ICYmIHR3ZWVuLl9yZXBlYXQpIHtcbiAgICAgIHRUaW1lID0gX2NsYW1wKDAsIHR3ZWVuLl90RHVyLCB0b3RhbFRpbWUpO1xuICAgICAgaXRlcmF0aW9uID0gX2FuaW1hdGlvbkN5Y2xlKHRUaW1lLCByZXBlYXREZWxheSk7XG4gICAgICB0d2Vlbi5feW95byAmJiBpdGVyYXRpb24gJiAxICYmIChyYXRpbyA9IDEgLSByYXRpbyk7XG5cbiAgICAgIGlmIChpdGVyYXRpb24gIT09IF9hbmltYXRpb25DeWNsZSh0d2Vlbi5fdFRpbWUsIHJlcGVhdERlbGF5KSkge1xuICAgICAgICBwcmV2UmF0aW8gPSAxIC0gcmF0aW87XG4gICAgICAgIHR3ZWVuLnZhcnMucmVwZWF0UmVmcmVzaCAmJiB0d2Vlbi5faW5pdHRlZCAmJiB0d2Vlbi5pbnZhbGlkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJhdGlvICE9PSBwcmV2UmF0aW8gfHwgZm9yY2UgfHwgdHdlZW4uX3pUaW1lID09PSBfdGlueU51bSB8fCAhdG90YWxUaW1lICYmIHR3ZWVuLl96VGltZSkge1xuICAgICAgaWYgKCF0d2Vlbi5faW5pdHRlZCAmJiBfYXR0ZW1wdEluaXRUd2Vlbih0d2VlbiwgdG90YWxUaW1lLCBmb3JjZSwgc3VwcHJlc3NFdmVudHMpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcHJldkl0ZXJhdGlvbiA9IHR3ZWVuLl96VGltZTtcbiAgICAgIHR3ZWVuLl96VGltZSA9IHRvdGFsVGltZSB8fCAoc3VwcHJlc3NFdmVudHMgPyBfdGlueU51bSA6IDApO1xuICAgICAgc3VwcHJlc3NFdmVudHMgfHwgKHN1cHByZXNzRXZlbnRzID0gdG90YWxUaW1lICYmICFwcmV2SXRlcmF0aW9uKTtcbiAgICAgIHR3ZWVuLnJhdGlvID0gcmF0aW87XG4gICAgICB0d2Vlbi5fZnJvbSAmJiAocmF0aW8gPSAxIC0gcmF0aW8pO1xuICAgICAgdHdlZW4uX3RpbWUgPSAwO1xuICAgICAgdHdlZW4uX3RUaW1lID0gdFRpbWU7XG4gICAgICBwdCA9IHR3ZWVuLl9wdDtcblxuICAgICAgd2hpbGUgKHB0KSB7XG4gICAgICAgIHB0LnIocmF0aW8sIHB0LmQpO1xuICAgICAgICBwdCA9IHB0Ll9uZXh0O1xuICAgICAgfVxuXG4gICAgICB0d2Vlbi5fc3RhcnRBdCAmJiB0b3RhbFRpbWUgPCAwICYmIHR3ZWVuLl9zdGFydEF0LnJlbmRlcih0b3RhbFRpbWUsIHRydWUsIHRydWUpO1xuICAgICAgdHdlZW4uX29uVXBkYXRlICYmICFzdXBwcmVzc0V2ZW50cyAmJiBfY2FsbGJhY2sodHdlZW4sIFwib25VcGRhdGVcIik7XG4gICAgICB0VGltZSAmJiB0d2Vlbi5fcmVwZWF0ICYmICFzdXBwcmVzc0V2ZW50cyAmJiB0d2Vlbi5wYXJlbnQgJiYgX2NhbGxiYWNrKHR3ZWVuLCBcIm9uUmVwZWF0XCIpO1xuXG4gICAgICBpZiAoKHRvdGFsVGltZSA+PSB0d2Vlbi5fdER1ciB8fCB0b3RhbFRpbWUgPCAwKSAmJiB0d2Vlbi5yYXRpbyA9PT0gcmF0aW8pIHtcbiAgICAgICAgcmF0aW8gJiYgX3JlbW92ZUZyb21QYXJlbnQodHdlZW4sIDEpO1xuXG4gICAgICAgIGlmICghc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgICAgICBfY2FsbGJhY2sodHdlZW4sIHJhdGlvID8gXCJvbkNvbXBsZXRlXCIgOiBcIm9uUmV2ZXJzZUNvbXBsZXRlXCIsIHRydWUpO1xuXG4gICAgICAgICAgdHdlZW4uX3Byb20gJiYgdHdlZW4uX3Byb20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXR3ZWVuLl96VGltZSkge1xuICAgICAgdHdlZW4uX3pUaW1lID0gdG90YWxUaW1lO1xuICAgIH1cbiAgfSxcbiAgICAgIF9maW5kTmV4dFBhdXNlVHdlZW4gPSBmdW5jdGlvbiBfZmluZE5leHRQYXVzZVR3ZWVuKGFuaW1hdGlvbiwgcHJldlRpbWUsIHRpbWUpIHtcbiAgICB2YXIgY2hpbGQ7XG5cbiAgICBpZiAodGltZSA+IHByZXZUaW1lKSB7XG4gICAgICBjaGlsZCA9IGFuaW1hdGlvbi5fZmlyc3Q7XG5cbiAgICAgIHdoaWxlIChjaGlsZCAmJiBjaGlsZC5fc3RhcnQgPD0gdGltZSkge1xuICAgICAgICBpZiAoY2hpbGQuZGF0YSA9PT0gXCJpc1BhdXNlXCIgJiYgY2hpbGQuX3N0YXJ0ID4gcHJldlRpbWUpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IGNoaWxkLl9uZXh0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IGFuaW1hdGlvbi5fbGFzdDtcblxuICAgICAgd2hpbGUgKGNoaWxkICYmIGNoaWxkLl9zdGFydCA+PSB0aW1lKSB7XG4gICAgICAgIGlmIChjaGlsZC5kYXRhID09PSBcImlzUGF1c2VcIiAmJiBjaGlsZC5fc3RhcnQgPCBwcmV2VGltZSkge1xuICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gY2hpbGQuX3ByZXY7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAgICAgX3NldER1cmF0aW9uID0gZnVuY3Rpb24gX3NldER1cmF0aW9uKGFuaW1hdGlvbiwgZHVyYXRpb24sIHNraXBVbmNhY2hlLCBsZWF2ZVBsYXloZWFkKSB7XG4gICAgdmFyIHJlcGVhdCA9IGFuaW1hdGlvbi5fcmVwZWF0LFxuICAgICAgICBkdXIgPSBfcm91bmRQcmVjaXNlKGR1cmF0aW9uKSB8fCAwLFxuICAgICAgICB0b3RhbFByb2dyZXNzID0gYW5pbWF0aW9uLl90VGltZSAvIGFuaW1hdGlvbi5fdER1cjtcbiAgICB0b3RhbFByb2dyZXNzICYmICFsZWF2ZVBsYXloZWFkICYmIChhbmltYXRpb24uX3RpbWUgKj0gZHVyIC8gYW5pbWF0aW9uLl9kdXIpO1xuICAgIGFuaW1hdGlvbi5fZHVyID0gZHVyO1xuICAgIGFuaW1hdGlvbi5fdER1ciA9ICFyZXBlYXQgPyBkdXIgOiByZXBlYXQgPCAwID8gMWUxMCA6IF9yb3VuZFByZWNpc2UoZHVyICogKHJlcGVhdCArIDEpICsgYW5pbWF0aW9uLl9yRGVsYXkgKiByZXBlYXQpO1xuICAgIHRvdGFsUHJvZ3Jlc3MgPiAwICYmICFsZWF2ZVBsYXloZWFkID8gX2FsaWduUGxheWhlYWQoYW5pbWF0aW9uLCBhbmltYXRpb24uX3RUaW1lID0gYW5pbWF0aW9uLl90RHVyICogdG90YWxQcm9ncmVzcykgOiBhbmltYXRpb24ucGFyZW50ICYmIF9zZXRFbmQoYW5pbWF0aW9uKTtcbiAgICBza2lwVW5jYWNoZSB8fCBfdW5jYWNoZShhbmltYXRpb24ucGFyZW50LCBhbmltYXRpb24pO1xuICAgIHJldHVybiBhbmltYXRpb247XG4gIH0sXG4gICAgICBfb25VcGRhdGVUb3RhbER1cmF0aW9uID0gZnVuY3Rpb24gX29uVXBkYXRlVG90YWxEdXJhdGlvbihhbmltYXRpb24pIHtcbiAgICByZXR1cm4gYW5pbWF0aW9uIGluc3RhbmNlb2YgVGltZWxpbmUgPyBfdW5jYWNoZShhbmltYXRpb24pIDogX3NldER1cmF0aW9uKGFuaW1hdGlvbiwgYW5pbWF0aW9uLl9kdXIpO1xuICB9LFxuICAgICAgX3plcm9Qb3NpdGlvbiA9IHtcbiAgICBfc3RhcnQ6IDAsXG4gICAgZW5kVGltZTogX2VtcHR5RnVuYyxcbiAgICB0b3RhbER1cmF0aW9uOiBfZW1wdHlGdW5jXG4gIH0sXG4gICAgICBfcGFyc2VQb3NpdGlvbiA9IGZ1bmN0aW9uIF9wYXJzZVBvc2l0aW9uKGFuaW1hdGlvbiwgcG9zaXRpb24sIHBlcmNlbnRBbmltYXRpb24pIHtcbiAgICB2YXIgbGFiZWxzID0gYW5pbWF0aW9uLmxhYmVscyxcbiAgICAgICAgcmVjZW50ID0gYW5pbWF0aW9uLl9yZWNlbnQgfHwgX3plcm9Qb3NpdGlvbixcbiAgICAgICAgY2xpcHBlZER1cmF0aW9uID0gYW5pbWF0aW9uLmR1cmF0aW9uKCkgPj0gX2JpZ051bSA/IHJlY2VudC5lbmRUaW1lKGZhbHNlKSA6IGFuaW1hdGlvbi5fZHVyLFxuICAgICAgICBpLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGlzUGVyY2VudDtcblxuICAgIGlmIChfaXNTdHJpbmcocG9zaXRpb24pICYmIChpc05hTihwb3NpdGlvbikgfHwgcG9zaXRpb24gaW4gbGFiZWxzKSkge1xuICAgICAgb2Zmc2V0ID0gcG9zaXRpb24uY2hhckF0KDApO1xuICAgICAgaXNQZXJjZW50ID0gcG9zaXRpb24uc3Vic3RyKC0xKSA9PT0gXCIlXCI7XG4gICAgICBpID0gcG9zaXRpb24uaW5kZXhPZihcIj1cIik7XG5cbiAgICAgIGlmIChvZmZzZXQgPT09IFwiPFwiIHx8IG9mZnNldCA9PT0gXCI+XCIpIHtcbiAgICAgICAgaSA+PSAwICYmIChwb3NpdGlvbiA9IHBvc2l0aW9uLnJlcGxhY2UoLz0vLCBcIlwiKSk7XG4gICAgICAgIHJldHVybiAob2Zmc2V0ID09PSBcIjxcIiA/IHJlY2VudC5fc3RhcnQgOiByZWNlbnQuZW5kVGltZShyZWNlbnQuX3JlcGVhdCA+PSAwKSkgKyAocGFyc2VGbG9hdChwb3NpdGlvbi5zdWJzdHIoMSkpIHx8IDApICogKGlzUGVyY2VudCA/IChpIDwgMCA/IHJlY2VudCA6IHBlcmNlbnRBbmltYXRpb24pLnRvdGFsRHVyYXRpb24oKSAvIDEwMCA6IDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgcG9zaXRpb24gaW4gbGFiZWxzIHx8IChsYWJlbHNbcG9zaXRpb25dID0gY2xpcHBlZER1cmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIGxhYmVsc1twb3NpdGlvbl07XG4gICAgICB9XG5cbiAgICAgIG9mZnNldCA9IHBhcnNlRmxvYXQocG9zaXRpb24uY2hhckF0KGkgLSAxKSArIHBvc2l0aW9uLnN1YnN0cihpICsgMSkpO1xuXG4gICAgICBpZiAoaXNQZXJjZW50ICYmIHBlcmNlbnRBbmltYXRpb24pIHtcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0IC8gMTAwICogKF9pc0FycmF5KHBlcmNlbnRBbmltYXRpb24pID8gcGVyY2VudEFuaW1hdGlvblswXSA6IHBlcmNlbnRBbmltYXRpb24pLnRvdGFsRHVyYXRpb24oKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGkgPiAxID8gX3BhcnNlUG9zaXRpb24oYW5pbWF0aW9uLCBwb3NpdGlvbi5zdWJzdHIoMCwgaSAtIDEpLCBwZXJjZW50QW5pbWF0aW9uKSArIG9mZnNldCA6IGNsaXBwZWREdXJhdGlvbiArIG9mZnNldDtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb24gPT0gbnVsbCA/IGNsaXBwZWREdXJhdGlvbiA6ICtwb3NpdGlvbjtcbiAgfSxcbiAgICAgIF9jcmVhdGVUd2VlblR5cGUgPSBmdW5jdGlvbiBfY3JlYXRlVHdlZW5UeXBlKHR5cGUsIHBhcmFtcywgdGltZWxpbmUpIHtcbiAgICB2YXIgaXNMZWdhY3kgPSBfaXNOdW1iZXIocGFyYW1zWzFdKSxcbiAgICAgICAgdmFyc0luZGV4ID0gKGlzTGVnYWN5ID8gMiA6IDEpICsgKHR5cGUgPCAyID8gMCA6IDEpLFxuICAgICAgICB2YXJzID0gcGFyYW1zW3ZhcnNJbmRleF0sXG4gICAgICAgIGlyVmFycyxcbiAgICAgICAgcGFyZW50O1xuXG4gICAgaXNMZWdhY3kgJiYgKHZhcnMuZHVyYXRpb24gPSBwYXJhbXNbMV0pO1xuICAgIHZhcnMucGFyZW50ID0gdGltZWxpbmU7XG5cbiAgICBpZiAodHlwZSkge1xuICAgICAgaXJWYXJzID0gdmFycztcbiAgICAgIHBhcmVudCA9IHRpbWVsaW5lO1xuXG4gICAgICB3aGlsZSAocGFyZW50ICYmICEoXCJpbW1lZGlhdGVSZW5kZXJcIiBpbiBpclZhcnMpKSB7XG4gICAgICAgIGlyVmFycyA9IHBhcmVudC52YXJzLmRlZmF1bHRzIHx8IHt9O1xuICAgICAgICBwYXJlbnQgPSBfaXNOb3RGYWxzZShwYXJlbnQudmFycy5pbmhlcml0KSAmJiBwYXJlbnQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICB2YXJzLmltbWVkaWF0ZVJlbmRlciA9IF9pc05vdEZhbHNlKGlyVmFycy5pbW1lZGlhdGVSZW5kZXIpO1xuICAgICAgdHlwZSA8IDIgPyB2YXJzLnJ1bkJhY2t3YXJkcyA9IDEgOiB2YXJzLnN0YXJ0QXQgPSBwYXJhbXNbdmFyc0luZGV4IC0gMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBUd2VlbihwYXJhbXNbMF0sIHZhcnMsIHBhcmFtc1t2YXJzSW5kZXggKyAxXSk7XG4gIH0sXG4gICAgICBfY29uZGl0aW9uYWxSZXR1cm4gPSBmdW5jdGlvbiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmMpIHtcbiAgICByZXR1cm4gdmFsdWUgfHwgdmFsdWUgPT09IDAgPyBmdW5jKHZhbHVlKSA6IGZ1bmM7XG4gIH0sXG4gICAgICBfY2xhbXAgPSBmdW5jdGlvbiBfY2xhbXAobWluLCBtYXgsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZTtcbiAgfSxcbiAgICAgIGdldFVuaXQgPSBmdW5jdGlvbiBnZXRVbml0KHZhbHVlLCB2KSB7XG4gICAgcmV0dXJuICFfaXNTdHJpbmcodmFsdWUpIHx8ICEodiA9IF91bml0RXhwLmV4ZWModmFsdWUpKSA/IFwiXCIgOiB2YWx1ZS5zdWJzdHIodi5pbmRleCArIHZbMF0ubGVuZ3RoKTtcbiAgfSxcbiAgICAgIGNsYW1wID0gZnVuY3Rpb24gY2xhbXAobWluLCBtYXgsIHZhbHVlKSB7XG4gICAgcmV0dXJuIF9jb25kaXRpb25hbFJldHVybih2YWx1ZSwgZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiBfY2xhbXAobWluLCBtYXgsIHYpO1xuICAgIH0pO1xuICB9LFxuICAgICAgX3NsaWNlID0gW10uc2xpY2UsXG4gICAgICBfaXNBcnJheUxpa2UgPSBmdW5jdGlvbiBfaXNBcnJheUxpa2UodmFsdWUsIG5vbkVtcHR5KSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIF9pc09iamVjdCh2YWx1ZSkgJiYgXCJsZW5ndGhcIiBpbiB2YWx1ZSAmJiAoIW5vbkVtcHR5ICYmICF2YWx1ZS5sZW5ndGggfHwgdmFsdWUubGVuZ3RoIC0gMSBpbiB2YWx1ZSAmJiBfaXNPYmplY3QodmFsdWVbMF0pKSAmJiAhdmFsdWUubm9kZVR5cGUgJiYgdmFsdWUgIT09IF93aW47XG4gIH0sXG4gICAgICBfZmxhdHRlbiA9IGZ1bmN0aW9uIF9mbGF0dGVuKGFyLCBsZWF2ZVN0cmluZ3MsIGFjY3VtdWxhdG9yKSB7XG4gICAgaWYgKGFjY3VtdWxhdG9yID09PSB2b2lkIDApIHtcbiAgICAgIGFjY3VtdWxhdG9yID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgX2FjY3VtdWxhdG9yO1xuXG4gICAgICByZXR1cm4gX2lzU3RyaW5nKHZhbHVlKSAmJiAhbGVhdmVTdHJpbmdzIHx8IF9pc0FycmF5TGlrZSh2YWx1ZSwgMSkgPyAoX2FjY3VtdWxhdG9yID0gYWNjdW11bGF0b3IpLnB1c2guYXBwbHkoX2FjY3VtdWxhdG9yLCB0b0FycmF5KHZhbHVlKSkgOiBhY2N1bXVsYXRvci5wdXNoKHZhbHVlKTtcbiAgICB9KSB8fCBhY2N1bXVsYXRvcjtcbiAgfSxcbiAgICAgIHRvQXJyYXkgPSBmdW5jdGlvbiB0b0FycmF5KHZhbHVlLCBzY29wZSwgbGVhdmVTdHJpbmdzKSB7XG4gICAgcmV0dXJuIF9pc1N0cmluZyh2YWx1ZSkgJiYgIWxlYXZlU3RyaW5ncyAmJiAoX2NvcmVJbml0dGVkIHx8ICFfd2FrZSgpKSA/IF9zbGljZS5jYWxsKChzY29wZSB8fCBfZG9jKS5xdWVyeVNlbGVjdG9yQWxsKHZhbHVlKSwgMCkgOiBfaXNBcnJheSh2YWx1ZSkgPyBfZmxhdHRlbih2YWx1ZSwgbGVhdmVTdHJpbmdzKSA6IF9pc0FycmF5TGlrZSh2YWx1ZSkgPyBfc2xpY2UuY2FsbCh2YWx1ZSwgMCkgOiB2YWx1ZSA/IFt2YWx1ZV0gOiBbXTtcbiAgfSxcbiAgICAgIHNlbGVjdG9yID0gZnVuY3Rpb24gc2VsZWN0b3IodmFsdWUpIHtcbiAgICB2YWx1ZSA9IHRvQXJyYXkodmFsdWUpWzBdIHx8IF93YXJuKFwiSW52YWxpZCBzY29wZVwiKSB8fCB7fTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgIHZhciBlbCA9IHZhbHVlLmN1cnJlbnQgfHwgdmFsdWUubmF0aXZlRWxlbWVudCB8fCB2YWx1ZTtcbiAgICAgIHJldHVybiB0b0FycmF5KHYsIGVsLnF1ZXJ5U2VsZWN0b3JBbGwgPyBlbCA6IGVsID09PSB2YWx1ZSA/IF93YXJuKFwiSW52YWxpZCBzY29wZVwiKSB8fCBfZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikgOiB2YWx1ZSk7XG4gICAgfTtcbiAgfSxcbiAgICAgIHNodWZmbGUgPSBmdW5jdGlvbiBzaHVmZmxlKGEpIHtcbiAgICByZXR1cm4gYS5zb3J0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAuNSAtIE1hdGgucmFuZG9tKCk7XG4gICAgfSk7XG4gIH0sXG4gICAgICBkaXN0cmlidXRlID0gZnVuY3Rpb24gZGlzdHJpYnV0ZSh2KSB7XG4gICAgaWYgKF9pc0Z1bmN0aW9uKHYpKSB7XG4gICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICB2YXIgdmFycyA9IF9pc09iamVjdCh2KSA/IHYgOiB7XG4gICAgICBlYWNoOiB2XG4gICAgfSxcbiAgICAgICAgZWFzZSA9IF9wYXJzZUVhc2UodmFycy5lYXNlKSxcbiAgICAgICAgZnJvbSA9IHZhcnMuZnJvbSB8fCAwLFxuICAgICAgICBiYXNlID0gcGFyc2VGbG9hdCh2YXJzLmJhc2UpIHx8IDAsXG4gICAgICAgIGNhY2hlID0ge30sXG4gICAgICAgIGlzRGVjaW1hbCA9IGZyb20gPiAwICYmIGZyb20gPCAxLFxuICAgICAgICByYXRpb3MgPSBpc05hTihmcm9tKSB8fCBpc0RlY2ltYWwsXG4gICAgICAgIGF4aXMgPSB2YXJzLmF4aXMsXG4gICAgICAgIHJhdGlvWCA9IGZyb20sXG4gICAgICAgIHJhdGlvWSA9IGZyb207XG5cbiAgICBpZiAoX2lzU3RyaW5nKGZyb20pKSB7XG4gICAgICByYXRpb1ggPSByYXRpb1kgPSB7XG4gICAgICAgIGNlbnRlcjogLjUsXG4gICAgICAgIGVkZ2VzOiAuNSxcbiAgICAgICAgZW5kOiAxXG4gICAgICB9W2Zyb21dIHx8IDA7XG4gICAgfSBlbHNlIGlmICghaXNEZWNpbWFsICYmIHJhdGlvcykge1xuICAgICAgcmF0aW9YID0gZnJvbVswXTtcbiAgICAgIHJhdGlvWSA9IGZyb21bMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChpLCB0YXJnZXQsIGEpIHtcbiAgICAgIHZhciBsID0gKGEgfHwgdmFycykubGVuZ3RoLFxuICAgICAgICAgIGRpc3RhbmNlcyA9IGNhY2hlW2xdLFxuICAgICAgICAgIG9yaWdpblgsXG4gICAgICAgICAgb3JpZ2luWSxcbiAgICAgICAgICB4LFxuICAgICAgICAgIHksXG4gICAgICAgICAgZCxcbiAgICAgICAgICBqLFxuICAgICAgICAgIG1heCxcbiAgICAgICAgICBtaW4sXG4gICAgICAgICAgd3JhcEF0O1xuXG4gICAgICBpZiAoIWRpc3RhbmNlcykge1xuICAgICAgICB3cmFwQXQgPSB2YXJzLmdyaWQgPT09IFwiYXV0b1wiID8gMCA6ICh2YXJzLmdyaWQgfHwgWzEsIF9iaWdOdW1dKVsxXTtcblxuICAgICAgICBpZiAoIXdyYXBBdCkge1xuICAgICAgICAgIG1heCA9IC1fYmlnTnVtO1xuXG4gICAgICAgICAgd2hpbGUgKG1heCA8IChtYXggPSBhW3dyYXBBdCsrXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0KSAmJiB3cmFwQXQgPCBsKSB7fVxuXG4gICAgICAgICAgd3JhcEF0LS07XG4gICAgICAgIH1cblxuICAgICAgICBkaXN0YW5jZXMgPSBjYWNoZVtsXSA9IFtdO1xuICAgICAgICBvcmlnaW5YID0gcmF0aW9zID8gTWF0aC5taW4od3JhcEF0LCBsKSAqIHJhdGlvWCAtIC41IDogZnJvbSAlIHdyYXBBdDtcbiAgICAgICAgb3JpZ2luWSA9IHdyYXBBdCA9PT0gX2JpZ051bSA/IDAgOiByYXRpb3MgPyBsICogcmF0aW9ZIC8gd3JhcEF0IC0gLjUgOiBmcm9tIC8gd3JhcEF0IHwgMDtcbiAgICAgICAgbWF4ID0gMDtcbiAgICAgICAgbWluID0gX2JpZ051bTtcblxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgeCA9IGogJSB3cmFwQXQgLSBvcmlnaW5YO1xuICAgICAgICAgIHkgPSBvcmlnaW5ZIC0gKGogLyB3cmFwQXQgfCAwKTtcbiAgICAgICAgICBkaXN0YW5jZXNbal0gPSBkID0gIWF4aXMgPyBfc3FydCh4ICogeCArIHkgKiB5KSA6IE1hdGguYWJzKGF4aXMgPT09IFwieVwiID8geSA6IHgpO1xuICAgICAgICAgIGQgPiBtYXggJiYgKG1heCA9IGQpO1xuICAgICAgICAgIGQgPCBtaW4gJiYgKG1pbiA9IGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbSA9PT0gXCJyYW5kb21cIiAmJiBzaHVmZmxlKGRpc3RhbmNlcyk7XG4gICAgICAgIGRpc3RhbmNlcy5tYXggPSBtYXggLSBtaW47XG4gICAgICAgIGRpc3RhbmNlcy5taW4gPSBtaW47XG4gICAgICAgIGRpc3RhbmNlcy52ID0gbCA9IChwYXJzZUZsb2F0KHZhcnMuYW1vdW50KSB8fCBwYXJzZUZsb2F0KHZhcnMuZWFjaCkgKiAod3JhcEF0ID4gbCA/IGwgLSAxIDogIWF4aXMgPyBNYXRoLm1heCh3cmFwQXQsIGwgLyB3cmFwQXQpIDogYXhpcyA9PT0gXCJ5XCIgPyBsIC8gd3JhcEF0IDogd3JhcEF0KSB8fCAwKSAqIChmcm9tID09PSBcImVkZ2VzXCIgPyAtMSA6IDEpO1xuICAgICAgICBkaXN0YW5jZXMuYiA9IGwgPCAwID8gYmFzZSAtIGwgOiBiYXNlO1xuICAgICAgICBkaXN0YW5jZXMudSA9IGdldFVuaXQodmFycy5hbW91bnQgfHwgdmFycy5lYWNoKSB8fCAwO1xuICAgICAgICBlYXNlID0gZWFzZSAmJiBsIDwgMCA/IF9pbnZlcnRFYXNlKGVhc2UpIDogZWFzZTtcbiAgICAgIH1cblxuICAgICAgbCA9IChkaXN0YW5jZXNbaV0gLSBkaXN0YW5jZXMubWluKSAvIGRpc3RhbmNlcy5tYXggfHwgMDtcbiAgICAgIHJldHVybiBfcm91bmRQcmVjaXNlKGRpc3RhbmNlcy5iICsgKGVhc2UgPyBlYXNlKGwpIDogbCkgKiBkaXN0YW5jZXMudikgKyBkaXN0YW5jZXMudTtcbiAgICB9O1xuICB9LFxuICAgICAgX3JvdW5kTW9kaWZpZXIgPSBmdW5jdGlvbiBfcm91bmRNb2RpZmllcih2KSB7XG4gICAgdmFyIHAgPSBNYXRoLnBvdygxMCwgKCh2ICsgXCJcIikuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgIHZhciBuID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHJhdykgLyB2KSAqIHYgKiBwO1xuICAgICAgcmV0dXJuIChuIC0gbiAlIDEpIC8gcCArIChfaXNOdW1iZXIocmF3KSA/IDAgOiBnZXRVbml0KHJhdykpO1xuICAgIH07XG4gIH0sXG4gICAgICBzbmFwID0gZnVuY3Rpb24gc25hcChzbmFwVG8sIHZhbHVlKSB7XG4gICAgdmFyIGlzQXJyYXkgPSBfaXNBcnJheShzbmFwVG8pLFxuICAgICAgICByYWRpdXMsXG4gICAgICAgIGlzMkQ7XG5cbiAgICBpZiAoIWlzQXJyYXkgJiYgX2lzT2JqZWN0KHNuYXBUbykpIHtcbiAgICAgIHJhZGl1cyA9IGlzQXJyYXkgPSBzbmFwVG8ucmFkaXVzIHx8IF9iaWdOdW07XG5cbiAgICAgIGlmIChzbmFwVG8udmFsdWVzKSB7XG4gICAgICAgIHNuYXBUbyA9IHRvQXJyYXkoc25hcFRvLnZhbHVlcyk7XG5cbiAgICAgICAgaWYgKGlzMkQgPSAhX2lzTnVtYmVyKHNuYXBUb1swXSkpIHtcbiAgICAgICAgICByYWRpdXMgKj0gcmFkaXVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzbmFwVG8gPSBfcm91bmRNb2RpZmllcihzbmFwVG8uaW5jcmVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2NvbmRpdGlvbmFsUmV0dXJuKHZhbHVlLCAhaXNBcnJheSA/IF9yb3VuZE1vZGlmaWVyKHNuYXBUbykgOiBfaXNGdW5jdGlvbihzbmFwVG8pID8gZnVuY3Rpb24gKHJhdykge1xuICAgICAgaXMyRCA9IHNuYXBUbyhyYXcpO1xuICAgICAgcmV0dXJuIE1hdGguYWJzKGlzMkQgLSByYXcpIDw9IHJhZGl1cyA/IGlzMkQgOiByYXc7XG4gICAgfSA6IGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgIHZhciB4ID0gcGFyc2VGbG9hdChpczJEID8gcmF3LnggOiByYXcpLFxuICAgICAgICAgIHkgPSBwYXJzZUZsb2F0KGlzMkQgPyByYXcueSA6IDApLFxuICAgICAgICAgIG1pbiA9IF9iaWdOdW0sXG4gICAgICAgICAgY2xvc2VzdCA9IDAsXG4gICAgICAgICAgaSA9IHNuYXBUby5sZW5ndGgsXG4gICAgICAgICAgZHgsXG4gICAgICAgICAgZHk7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKGlzMkQpIHtcbiAgICAgICAgICBkeCA9IHNuYXBUb1tpXS54IC0geDtcbiAgICAgICAgICBkeSA9IHNuYXBUb1tpXS55IC0geTtcbiAgICAgICAgICBkeCA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGR4ID0gTWF0aC5hYnMoc25hcFRvW2ldIC0geCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHggPCBtaW4pIHtcbiAgICAgICAgICBtaW4gPSBkeDtcbiAgICAgICAgICBjbG9zZXN0ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbG9zZXN0ID0gIXJhZGl1cyB8fCBtaW4gPD0gcmFkaXVzID8gc25hcFRvW2Nsb3Nlc3RdIDogcmF3O1xuICAgICAgcmV0dXJuIGlzMkQgfHwgY2xvc2VzdCA9PT0gcmF3IHx8IF9pc051bWJlcihyYXcpID8gY2xvc2VzdCA6IGNsb3Nlc3QgKyBnZXRVbml0KHJhdyk7XG4gICAgfSk7XG4gIH0sXG4gICAgICByYW5kb20gPSBmdW5jdGlvbiByYW5kb20obWluLCBtYXgsIHJvdW5kaW5nSW5jcmVtZW50LCByZXR1cm5GdW5jdGlvbikge1xuICAgIHJldHVybiBfY29uZGl0aW9uYWxSZXR1cm4oX2lzQXJyYXkobWluKSA/ICFtYXggOiByb3VuZGluZ0luY3JlbWVudCA9PT0gdHJ1ZSA/ICEhKHJvdW5kaW5nSW5jcmVtZW50ID0gMCkgOiAhcmV0dXJuRnVuY3Rpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfaXNBcnJheShtaW4pID8gbWluW35+KE1hdGgucmFuZG9tKCkgKiBtaW4ubGVuZ3RoKV0gOiAocm91bmRpbmdJbmNyZW1lbnQgPSByb3VuZGluZ0luY3JlbWVudCB8fCAxZS01KSAmJiAocmV0dXJuRnVuY3Rpb24gPSByb3VuZGluZ0luY3JlbWVudCA8IDEgPyBNYXRoLnBvdygxMCwgKHJvdW5kaW5nSW5jcmVtZW50ICsgXCJcIikubGVuZ3RoIC0gMikgOiAxKSAmJiBNYXRoLmZsb29yKE1hdGgucm91bmQoKG1pbiAtIHJvdW5kaW5nSW5jcmVtZW50IC8gMiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgcm91bmRpbmdJbmNyZW1lbnQgKiAuOTkpKSAvIHJvdW5kaW5nSW5jcmVtZW50KSAqIHJvdW5kaW5nSW5jcmVtZW50ICogcmV0dXJuRnVuY3Rpb24pIC8gcmV0dXJuRnVuY3Rpb247XG4gICAgfSk7XG4gIH0sXG4gICAgICBwaXBlID0gZnVuY3Rpb24gcGlwZSgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3Rpb25zID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgZnVuY3Rpb25zW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbnMucmVkdWNlKGZ1bmN0aW9uICh2LCBmKSB7XG4gICAgICAgIHJldHVybiBmKHYpO1xuICAgICAgfSwgdmFsdWUpO1xuICAgIH07XG4gIH0sXG4gICAgICB1bml0aXplID0gZnVuY3Rpb24gdW5pdGl6ZShmdW5jLCB1bml0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmMocGFyc2VGbG9hdCh2YWx1ZSkpICsgKHVuaXQgfHwgZ2V0VW5pdCh2YWx1ZSkpO1xuICAgIH07XG4gIH0sXG4gICAgICBub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUobWluLCBtYXgsIHZhbHVlKSB7XG4gICAgcmV0dXJuIG1hcFJhbmdlKG1pbiwgbWF4LCAwLCAxLCB2YWx1ZSk7XG4gIH0sXG4gICAgICBfd3JhcEFycmF5ID0gZnVuY3Rpb24gX3dyYXBBcnJheShhLCB3cmFwcGVyLCB2YWx1ZSkge1xuICAgIHJldHVybiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgcmV0dXJuIGFbfn53cmFwcGVyKGluZGV4KV07XG4gICAgfSk7XG4gIH0sXG4gICAgICB3cmFwID0gZnVuY3Rpb24gd3JhcChtaW4sIG1heCwgdmFsdWUpIHtcbiAgICB2YXIgcmFuZ2UgPSBtYXggLSBtaW47XG4gICAgcmV0dXJuIF9pc0FycmF5KG1pbikgPyBfd3JhcEFycmF5KG1pbiwgd3JhcCgwLCBtaW4ubGVuZ3RoKSwgbWF4KSA6IF9jb25kaXRpb25hbFJldHVybih2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKHJhbmdlICsgKHZhbHVlIC0gbWluKSAlIHJhbmdlKSAlIHJhbmdlICsgbWluO1xuICAgIH0pO1xuICB9LFxuICAgICAgd3JhcFlveW8gPSBmdW5jdGlvbiB3cmFwWW95byhtaW4sIG1heCwgdmFsdWUpIHtcbiAgICB2YXIgcmFuZ2UgPSBtYXggLSBtaW4sXG4gICAgICAgIHRvdGFsID0gcmFuZ2UgKiAyO1xuICAgIHJldHVybiBfaXNBcnJheShtaW4pID8gX3dyYXBBcnJheShtaW4sIHdyYXBZb3lvKDAsIG1pbi5sZW5ndGggLSAxKSwgbWF4KSA6IF9jb25kaXRpb25hbFJldHVybih2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICh0b3RhbCArICh2YWx1ZSAtIG1pbikgJSB0b3RhbCkgJSB0b3RhbCB8fCAwO1xuICAgICAgcmV0dXJuIG1pbiArICh2YWx1ZSA+IHJhbmdlID8gdG90YWwgLSB2YWx1ZSA6IHZhbHVlKTtcbiAgICB9KTtcbiAgfSxcbiAgICAgIF9yZXBsYWNlUmFuZG9tID0gZnVuY3Rpb24gX3JlcGxhY2VSYW5kb20odmFsdWUpIHtcbiAgICB2YXIgcHJldiA9IDAsXG4gICAgICAgIHMgPSBcIlwiLFxuICAgICAgICBpLFxuICAgICAgICBudW1zLFxuICAgICAgICBlbmQsXG4gICAgICAgIGlzQXJyYXk7XG5cbiAgICB3aGlsZSAofihpID0gdmFsdWUuaW5kZXhPZihcInJhbmRvbShcIiwgcHJldikpKSB7XG4gICAgICBlbmQgPSB2YWx1ZS5pbmRleE9mKFwiKVwiLCBpKTtcbiAgICAgIGlzQXJyYXkgPSB2YWx1ZS5jaGFyQXQoaSArIDcpID09PSBcIltcIjtcbiAgICAgIG51bXMgPSB2YWx1ZS5zdWJzdHIoaSArIDcsIGVuZCAtIGkgLSA3KS5tYXRjaChpc0FycmF5ID8gX2RlbGltaXRlZFZhbHVlRXhwIDogX3N0cmljdE51bUV4cCk7XG4gICAgICBzICs9IHZhbHVlLnN1YnN0cihwcmV2LCBpIC0gcHJldikgKyByYW5kb20oaXNBcnJheSA/IG51bXMgOiArbnVtc1swXSwgaXNBcnJheSA/IDAgOiArbnVtc1sxXSwgK251bXNbMl0gfHwgMWUtNSk7XG4gICAgICBwcmV2ID0gZW5kICsgMTtcbiAgICB9XG5cbiAgICByZXR1cm4gcyArIHZhbHVlLnN1YnN0cihwcmV2LCB2YWx1ZS5sZW5ndGggLSBwcmV2KTtcbiAgfSxcbiAgICAgIG1hcFJhbmdlID0gZnVuY3Rpb24gbWFwUmFuZ2UoaW5NaW4sIGluTWF4LCBvdXRNaW4sIG91dE1heCwgdmFsdWUpIHtcbiAgICB2YXIgaW5SYW5nZSA9IGluTWF4IC0gaW5NaW4sXG4gICAgICAgIG91dFJhbmdlID0gb3V0TWF4IC0gb3V0TWluO1xuICAgIHJldHVybiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIG91dE1pbiArICgodmFsdWUgLSBpbk1pbikgLyBpblJhbmdlICogb3V0UmFuZ2UgfHwgMCk7XG4gICAgfSk7XG4gIH0sXG4gICAgICBpbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uIGludGVycG9sYXRlKHN0YXJ0LCBlbmQsIHByb2dyZXNzLCBtdXRhdGUpIHtcbiAgICB2YXIgZnVuYyA9IGlzTmFOKHN0YXJ0ICsgZW5kKSA/IDAgOiBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuICgxIC0gcCkgKiBzdGFydCArIHAgKiBlbmQ7XG4gICAgfTtcblxuICAgIGlmICghZnVuYykge1xuICAgICAgdmFyIGlzU3RyaW5nID0gX2lzU3RyaW5nKHN0YXJ0KSxcbiAgICAgICAgICBtYXN0ZXIgPSB7fSxcbiAgICAgICAgICBwLFxuICAgICAgICAgIGksXG4gICAgICAgICAgaW50ZXJwb2xhdG9ycyxcbiAgICAgICAgICBsLFxuICAgICAgICAgIGlsO1xuXG4gICAgICBwcm9ncmVzcyA9PT0gdHJ1ZSAmJiAobXV0YXRlID0gMSkgJiYgKHByb2dyZXNzID0gbnVsbCk7XG5cbiAgICAgIGlmIChpc1N0cmluZykge1xuICAgICAgICBzdGFydCA9IHtcbiAgICAgICAgICBwOiBzdGFydFxuICAgICAgICB9O1xuICAgICAgICBlbmQgPSB7XG4gICAgICAgICAgcDogZW5kXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF9pc0FycmF5KHN0YXJ0KSAmJiAhX2lzQXJyYXkoZW5kKSkge1xuICAgICAgICBpbnRlcnBvbGF0b3JzID0gW107XG4gICAgICAgIGwgPSBzdGFydC5sZW5ndGg7XG4gICAgICAgIGlsID0gbCAtIDI7XG5cbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGludGVycG9sYXRvcnMucHVzaChpbnRlcnBvbGF0ZShzdGFydFtpIC0gMV0sIHN0YXJ0W2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICBsLS07XG5cbiAgICAgICAgZnVuYyA9IGZ1bmN0aW9uIGZ1bmMocCkge1xuICAgICAgICAgIHAgKj0gbDtcbiAgICAgICAgICB2YXIgaSA9IE1hdGgubWluKGlsLCB+fnApO1xuICAgICAgICAgIHJldHVybiBpbnRlcnBvbGF0b3JzW2ldKHAgLSBpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBwcm9ncmVzcyA9IGVuZDtcbiAgICAgIH0gZWxzZSBpZiAoIW11dGF0ZSkge1xuICAgICAgICBzdGFydCA9IF9tZXJnZShfaXNBcnJheShzdGFydCkgPyBbXSA6IHt9LCBzdGFydCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaW50ZXJwb2xhdG9ycykge1xuICAgICAgICBmb3IgKHAgaW4gZW5kKSB7XG4gICAgICAgICAgX2FkZFByb3BUd2Vlbi5jYWxsKG1hc3Rlciwgc3RhcnQsIHAsIFwiZ2V0XCIsIGVuZFtwXSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jID0gZnVuY3Rpb24gZnVuYyhwKSB7XG4gICAgICAgICAgcmV0dXJuIF9yZW5kZXJQcm9wVHdlZW5zKHAsIG1hc3RlcikgfHwgKGlzU3RyaW5nID8gc3RhcnQucCA6IHN0YXJ0KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2NvbmRpdGlvbmFsUmV0dXJuKHByb2dyZXNzLCBmdW5jKTtcbiAgfSxcbiAgICAgIF9nZXRMYWJlbEluRGlyZWN0aW9uID0gZnVuY3Rpb24gX2dldExhYmVsSW5EaXJlY3Rpb24odGltZWxpbmUsIGZyb21UaW1lLCBiYWNrd2FyZCkge1xuICAgIHZhciBsYWJlbHMgPSB0aW1lbGluZS5sYWJlbHMsXG4gICAgICAgIG1pbiA9IF9iaWdOdW0sXG4gICAgICAgIHAsXG4gICAgICAgIGRpc3RhbmNlLFxuICAgICAgICBsYWJlbDtcblxuICAgIGZvciAocCBpbiBsYWJlbHMpIHtcbiAgICAgIGRpc3RhbmNlID0gbGFiZWxzW3BdIC0gZnJvbVRpbWU7XG5cbiAgICAgIGlmIChkaXN0YW5jZSA8IDAgPT09ICEhYmFja3dhcmQgJiYgZGlzdGFuY2UgJiYgbWluID4gKGRpc3RhbmNlID0gTWF0aC5hYnMoZGlzdGFuY2UpKSkge1xuICAgICAgICBsYWJlbCA9IHA7XG4gICAgICAgIG1pbiA9IGRpc3RhbmNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsYWJlbDtcbiAgfSxcbiAgICAgIF9jYWxsYmFjayA9IGZ1bmN0aW9uIF9jYWxsYmFjayhhbmltYXRpb24sIHR5cGUsIGV4ZWN1dGVMYXp5Rmlyc3QpIHtcbiAgICB2YXIgdiA9IGFuaW1hdGlvbi52YXJzLFxuICAgICAgICBjYWxsYmFjayA9IHZbdHlwZV0sXG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgc2NvcGU7XG5cbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcGFyYW1zID0gdlt0eXBlICsgXCJQYXJhbXNcIl07XG4gICAgc2NvcGUgPSB2LmNhbGxiYWNrU2NvcGUgfHwgYW5pbWF0aW9uO1xuICAgIGV4ZWN1dGVMYXp5Rmlyc3QgJiYgX2xhenlUd2VlbnMubGVuZ3RoICYmIF9sYXp5UmVuZGVyKCk7XG4gICAgcmV0dXJuIHBhcmFtcyA/IGNhbGxiYWNrLmFwcGx5KHNjb3BlLCBwYXJhbXMpIDogY2FsbGJhY2suY2FsbChzY29wZSk7XG4gIH0sXG4gICAgICBfaW50ZXJydXB0ID0gZnVuY3Rpb24gX2ludGVycnVwdChhbmltYXRpb24pIHtcbiAgICBfcmVtb3ZlRnJvbVBhcmVudChhbmltYXRpb24pO1xuXG4gICAgYW5pbWF0aW9uLnNjcm9sbFRyaWdnZXIgJiYgYW5pbWF0aW9uLnNjcm9sbFRyaWdnZXIua2lsbChmYWxzZSk7XG4gICAgYW5pbWF0aW9uLnByb2dyZXNzKCkgPCAxICYmIF9jYWxsYmFjayhhbmltYXRpb24sIFwib25JbnRlcnJ1cHRcIik7XG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfSxcbiAgICAgIF9xdWlja1R3ZWVuLFxuICAgICAgX2NyZWF0ZVBsdWdpbiA9IGZ1bmN0aW9uIF9jcmVhdGVQbHVnaW4oY29uZmlnKSB7XG4gICAgY29uZmlnID0gIWNvbmZpZy5uYW1lICYmIGNvbmZpZ1tcImRlZmF1bHRcIl0gfHwgY29uZmlnO1xuXG4gICAgdmFyIG5hbWUgPSBjb25maWcubmFtZSxcbiAgICAgICAgaXNGdW5jID0gX2lzRnVuY3Rpb24oY29uZmlnKSxcbiAgICAgICAgUGx1Z2luID0gbmFtZSAmJiAhaXNGdW5jICYmIGNvbmZpZy5pbml0ID8gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fcHJvcHMgPSBbXTtcbiAgICB9IDogY29uZmlnLFxuICAgICAgICBpbnN0YW5jZURlZmF1bHRzID0ge1xuICAgICAgaW5pdDogX2VtcHR5RnVuYyxcbiAgICAgIHJlbmRlcjogX3JlbmRlclByb3BUd2VlbnMsXG4gICAgICBhZGQ6IF9hZGRQcm9wVHdlZW4sXG4gICAgICBraWxsOiBfa2lsbFByb3BUd2VlbnNPZixcbiAgICAgIG1vZGlmaWVyOiBfYWRkUGx1Z2luTW9kaWZpZXIsXG4gICAgICByYXdWYXJzOiAwXG4gICAgfSxcbiAgICAgICAgc3RhdGljcyA9IHtcbiAgICAgIHRhcmdldFRlc3Q6IDAsXG4gICAgICBnZXQ6IDAsXG4gICAgICBnZXRTZXR0ZXI6IF9nZXRTZXR0ZXIsXG4gICAgICBhbGlhc2VzOiB7fSxcbiAgICAgIHJlZ2lzdGVyOiAwXG4gICAgfTtcblxuICAgIF93YWtlKCk7XG5cbiAgICBpZiAoY29uZmlnICE9PSBQbHVnaW4pIHtcbiAgICAgIGlmIChfcGx1Z2luc1tuYW1lXSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF9zZXREZWZhdWx0cyhQbHVnaW4sIF9zZXREZWZhdWx0cyhfY29weUV4Y2x1ZGluZyhjb25maWcsIGluc3RhbmNlRGVmYXVsdHMpLCBzdGF0aWNzKSk7XG5cbiAgICAgIF9tZXJnZShQbHVnaW4ucHJvdG90eXBlLCBfbWVyZ2UoaW5zdGFuY2VEZWZhdWx0cywgX2NvcHlFeGNsdWRpbmcoY29uZmlnLCBzdGF0aWNzKSkpO1xuXG4gICAgICBfcGx1Z2luc1tQbHVnaW4ucHJvcCA9IG5hbWVdID0gUGx1Z2luO1xuXG4gICAgICBpZiAoY29uZmlnLnRhcmdldFRlc3QpIHtcbiAgICAgICAgX2hhcm5lc3NQbHVnaW5zLnB1c2goUGx1Z2luKTtcblxuICAgICAgICBfcmVzZXJ2ZWRQcm9wc1tuYW1lXSA9IDE7XG4gICAgICB9XG5cbiAgICAgIG5hbWUgPSAobmFtZSA9PT0gXCJjc3NcIiA/IFwiQ1NTXCIgOiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHIoMSkpICsgXCJQbHVnaW5cIjtcbiAgICB9XG5cbiAgICBfYWRkR2xvYmFsKG5hbWUsIFBsdWdpbik7XG5cbiAgICBjb25maWcucmVnaXN0ZXIgJiYgY29uZmlnLnJlZ2lzdGVyKGdzYXAsIFBsdWdpbiwgUHJvcFR3ZWVuKTtcbiAgfSxcbiAgICAgIF8yNTUgPSAyNTUsXG4gICAgICBfY29sb3JMb29rdXAgPSB7XG4gICAgYXF1YTogWzAsIF8yNTUsIF8yNTVdLFxuICAgIGxpbWU6IFswLCBfMjU1LCAwXSxcbiAgICBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXSxcbiAgICBibGFjazogWzAsIDAsIDBdLFxuICAgIG1hcm9vbjogWzEyOCwgMCwgMF0sXG4gICAgdGVhbDogWzAsIDEyOCwgMTI4XSxcbiAgICBibHVlOiBbMCwgMCwgXzI1NV0sXG4gICAgbmF2eTogWzAsIDAsIDEyOF0sXG4gICAgd2hpdGU6IFtfMjU1LCBfMjU1LCBfMjU1XSxcbiAgICBvbGl2ZTogWzEyOCwgMTI4LCAwXSxcbiAgICB5ZWxsb3c6IFtfMjU1LCBfMjU1LCAwXSxcbiAgICBvcmFuZ2U6IFtfMjU1LCAxNjUsIDBdLFxuICAgIGdyYXk6IFsxMjgsIDEyOCwgMTI4XSxcbiAgICBwdXJwbGU6IFsxMjgsIDAsIDEyOF0sXG4gICAgZ3JlZW46IFswLCAxMjgsIDBdLFxuICAgIHJlZDogW18yNTUsIDAsIDBdLFxuICAgIHBpbms6IFtfMjU1LCAxOTIsIDIwM10sXG4gICAgY3lhbjogWzAsIF8yNTUsIF8yNTVdLFxuICAgIHRyYW5zcGFyZW50OiBbXzI1NSwgXzI1NSwgXzI1NSwgMF1cbiAgfSxcbiAgICAgIF9odWUgPSBmdW5jdGlvbiBfaHVlKGgsIG0xLCBtMikge1xuICAgIGggKz0gaCA8IDAgPyAxIDogaCA+IDEgPyAtMSA6IDA7XG4gICAgcmV0dXJuIChoICogNiA8IDEgPyBtMSArIChtMiAtIG0xKSAqIGggKiA2IDogaCA8IC41ID8gbTIgOiBoICogMyA8IDIgPyBtMSArIChtMiAtIG0xKSAqICgyIC8gMyAtIGgpICogNiA6IG0xKSAqIF8yNTUgKyAuNSB8IDA7XG4gIH0sXG4gICAgICBzcGxpdENvbG9yID0gZnVuY3Rpb24gc3BsaXRDb2xvcih2LCB0b0hTTCwgZm9yY2VBbHBoYSkge1xuICAgIHZhciBhID0gIXYgPyBfY29sb3JMb29rdXAuYmxhY2sgOiBfaXNOdW1iZXIodikgPyBbdiA+PiAxNiwgdiA+PiA4ICYgXzI1NSwgdiAmIF8yNTVdIDogMCxcbiAgICAgICAgcixcbiAgICAgICAgZyxcbiAgICAgICAgYixcbiAgICAgICAgaCxcbiAgICAgICAgcyxcbiAgICAgICAgbCxcbiAgICAgICAgbWF4LFxuICAgICAgICBtaW4sXG4gICAgICAgIGQsXG4gICAgICAgIHdhc0hTTDtcblxuICAgIGlmICghYSkge1xuICAgICAgaWYgKHYuc3Vic3RyKC0xKSA9PT0gXCIsXCIpIHtcbiAgICAgICAgdiA9IHYuc3Vic3RyKDAsIHYubGVuZ3RoIC0gMSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChfY29sb3JMb29rdXBbdl0pIHtcbiAgICAgICAgYSA9IF9jb2xvckxvb2t1cFt2XTtcbiAgICAgIH0gZWxzZSBpZiAodi5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCA8IDYpIHtcbiAgICAgICAgICByID0gdi5jaGFyQXQoMSk7XG4gICAgICAgICAgZyA9IHYuY2hhckF0KDIpO1xuICAgICAgICAgIGIgPSB2LmNoYXJBdCgzKTtcbiAgICAgICAgICB2ID0gXCIjXCIgKyByICsgciArIGcgKyBnICsgYiArIGIgKyAodi5sZW5ndGggPT09IDUgPyB2LmNoYXJBdCg0KSArIHYuY2hhckF0KDQpIDogXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodi5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICBhID0gcGFyc2VJbnQodi5zdWJzdHIoMSwgNiksIDE2KTtcbiAgICAgICAgICByZXR1cm4gW2EgPj4gMTYsIGEgPj4gOCAmIF8yNTUsIGEgJiBfMjU1LCBwYXJzZUludCh2LnN1YnN0cig3KSwgMTYpIC8gMjU1XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHYgPSBwYXJzZUludCh2LnN1YnN0cigxKSwgMTYpO1xuICAgICAgICBhID0gW3YgPj4gMTYsIHYgPj4gOCAmIF8yNTUsIHYgJiBfMjU1XTtcbiAgICAgIH0gZWxzZSBpZiAodi5zdWJzdHIoMCwgMykgPT09IFwiaHNsXCIpIHtcbiAgICAgICAgYSA9IHdhc0hTTCA9IHYubWF0Y2goX3N0cmljdE51bUV4cCk7XG5cbiAgICAgICAgaWYgKCF0b0hTTCkge1xuICAgICAgICAgIGggPSArYVswXSAlIDM2MCAvIDM2MDtcbiAgICAgICAgICBzID0gK2FbMV0gLyAxMDA7XG4gICAgICAgICAgbCA9ICthWzJdIC8gMTAwO1xuICAgICAgICAgIGcgPSBsIDw9IC41ID8gbCAqIChzICsgMSkgOiBsICsgcyAtIGwgKiBzO1xuICAgICAgICAgIHIgPSBsICogMiAtIGc7XG4gICAgICAgICAgYS5sZW5ndGggPiAzICYmIChhWzNdICo9IDEpO1xuICAgICAgICAgIGFbMF0gPSBfaHVlKGggKyAxIC8gMywgciwgZyk7XG4gICAgICAgICAgYVsxXSA9IF9odWUoaCwgciwgZyk7XG4gICAgICAgICAgYVsyXSA9IF9odWUoaCAtIDEgLyAzLCByLCBnKTtcbiAgICAgICAgfSBlbHNlIGlmICh+di5pbmRleE9mKFwiPVwiKSkge1xuICAgICAgICAgIGEgPSB2Lm1hdGNoKF9udW1FeHApO1xuICAgICAgICAgIGZvcmNlQWxwaGEgJiYgYS5sZW5ndGggPCA0ICYmIChhWzNdID0gMSk7XG4gICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGEgPSB2Lm1hdGNoKF9zdHJpY3ROdW1FeHApIHx8IF9jb2xvckxvb2t1cC50cmFuc3BhcmVudDtcbiAgICAgIH1cblxuICAgICAgYSA9IGEubWFwKE51bWJlcik7XG4gICAgfVxuXG4gICAgaWYgKHRvSFNMICYmICF3YXNIU0wpIHtcbiAgICAgIHIgPSBhWzBdIC8gXzI1NTtcbiAgICAgIGcgPSBhWzFdIC8gXzI1NTtcbiAgICAgIGIgPSBhWzJdIC8gXzI1NTtcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuXG4gICAgICBpZiAobWF4ID09PSBtaW4pIHtcbiAgICAgICAgaCA9IHMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZCA9IG1heCAtIG1pbjtcbiAgICAgICAgcyA9IGwgPiAwLjUgPyBkIC8gKDIgLSBtYXggLSBtaW4pIDogZCAvIChtYXggKyBtaW4pO1xuICAgICAgICBoID0gbWF4ID09PSByID8gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCkgOiBtYXggPT09IGcgPyAoYiAtIHIpIC8gZCArIDIgOiAociAtIGcpIC8gZCArIDQ7XG4gICAgICAgIGggKj0gNjA7XG4gICAgICB9XG5cbiAgICAgIGFbMF0gPSB+fihoICsgLjUpO1xuICAgICAgYVsxXSA9IH5+KHMgKiAxMDAgKyAuNSk7XG4gICAgICBhWzJdID0gfn4obCAqIDEwMCArIC41KTtcbiAgICB9XG5cbiAgICBmb3JjZUFscGhhICYmIGEubGVuZ3RoIDwgNCAmJiAoYVszXSA9IDEpO1xuICAgIHJldHVybiBhO1xuICB9LFxuICAgICAgX2NvbG9yT3JkZXJEYXRhID0gZnVuY3Rpb24gX2NvbG9yT3JkZXJEYXRhKHYpIHtcbiAgICB2YXIgdmFsdWVzID0gW10sXG4gICAgICAgIGMgPSBbXSxcbiAgICAgICAgaSA9IC0xO1xuICAgIHYuc3BsaXQoX2NvbG9yRXhwKS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICB2YXIgYSA9IHYubWF0Y2goX251bVdpdGhVbml0RXhwKSB8fCBbXTtcbiAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgYSk7XG4gICAgICBjLnB1c2goaSArPSBhLmxlbmd0aCArIDEpO1xuICAgIH0pO1xuICAgIHZhbHVlcy5jID0gYztcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9LFxuICAgICAgX2Zvcm1hdENvbG9ycyA9IGZ1bmN0aW9uIF9mb3JtYXRDb2xvcnMocywgdG9IU0wsIG9yZGVyTWF0Y2hEYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IFwiXCIsXG4gICAgICAgIGNvbG9ycyA9IChzICsgcmVzdWx0KS5tYXRjaChfY29sb3JFeHApLFxuICAgICAgICB0eXBlID0gdG9IU0wgPyBcImhzbGEoXCIgOiBcInJnYmEoXCIsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBjLFxuICAgICAgICBzaGVsbCxcbiAgICAgICAgZCxcbiAgICAgICAgbDtcblxuICAgIGlmICghY29sb3JzKSB7XG4gICAgICByZXR1cm4gcztcbiAgICB9XG5cbiAgICBjb2xvcnMgPSBjb2xvcnMubWFwKGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgcmV0dXJuIChjb2xvciA9IHNwbGl0Q29sb3IoY29sb3IsIHRvSFNMLCAxKSkgJiYgdHlwZSArICh0b0hTTCA/IGNvbG9yWzBdICsgXCIsXCIgKyBjb2xvclsxXSArIFwiJSxcIiArIGNvbG9yWzJdICsgXCIlLFwiICsgY29sb3JbM10gOiBjb2xvci5qb2luKFwiLFwiKSkgKyBcIilcIjtcbiAgICB9KTtcblxuICAgIGlmIChvcmRlck1hdGNoRGF0YSkge1xuICAgICAgZCA9IF9jb2xvck9yZGVyRGF0YShzKTtcbiAgICAgIGMgPSBvcmRlck1hdGNoRGF0YS5jO1xuXG4gICAgICBpZiAoYy5qb2luKHJlc3VsdCkgIT09IGQuYy5qb2luKHJlc3VsdCkpIHtcbiAgICAgICAgc2hlbGwgPSBzLnJlcGxhY2UoX2NvbG9yRXhwLCBcIjFcIikuc3BsaXQoX251bVdpdGhVbml0RXhwKTtcbiAgICAgICAgbCA9IHNoZWxsLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICByZXN1bHQgKz0gc2hlbGxbaV0gKyAofmMuaW5kZXhPZihpKSA/IGNvbG9ycy5zaGlmdCgpIHx8IHR5cGUgKyBcIjAsMCwwLDApXCIgOiAoZC5sZW5ndGggPyBkIDogY29sb3JzLmxlbmd0aCA/IGNvbG9ycyA6IG9yZGVyTWF0Y2hEYXRhKS5zaGlmdCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghc2hlbGwpIHtcbiAgICAgIHNoZWxsID0gcy5zcGxpdChfY29sb3JFeHApO1xuICAgICAgbCA9IHNoZWxsLmxlbmd0aCAtIDE7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCArPSBzaGVsbFtpXSArIGNvbG9yc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0ICsgc2hlbGxbbF07XG4gIH0sXG4gICAgICBfY29sb3JFeHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHMgPSBcIig/OlxcXFxiKD86KD86cmdifHJnYmF8aHNsfGhzbGEpXFxcXCguKz9cXFxcKSl8XFxcXEIjKD86WzAtOWEtZl17Myw0fSl7MSwyfVxcXFxiXCIsXG4gICAgICAgIHA7XG5cbiAgICBmb3IgKHAgaW4gX2NvbG9yTG9va3VwKSB7XG4gICAgICBzICs9IFwifFwiICsgcCArIFwiXFxcXGJcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzICsgXCIpXCIsIFwiZ2lcIik7XG4gIH0oKSxcbiAgICAgIF9oc2xFeHAgPSAvaHNsW2FdP1xcKC8sXG4gICAgICBfY29sb3JTdHJpbmdGaWx0ZXIgPSBmdW5jdGlvbiBfY29sb3JTdHJpbmdGaWx0ZXIoYSkge1xuICAgIHZhciBjb21iaW5lZCA9IGEuam9pbihcIiBcIiksXG4gICAgICAgIHRvSFNMO1xuICAgIF9jb2xvckV4cC5sYXN0SW5kZXggPSAwO1xuXG4gICAgaWYgKF9jb2xvckV4cC50ZXN0KGNvbWJpbmVkKSkge1xuICAgICAgdG9IU0wgPSBfaHNsRXhwLnRlc3QoY29tYmluZWQpO1xuICAgICAgYVsxXSA9IF9mb3JtYXRDb2xvcnMoYVsxXSwgdG9IU0wpO1xuICAgICAgYVswXSA9IF9mb3JtYXRDb2xvcnMoYVswXSwgdG9IU0wsIF9jb2xvck9yZGVyRGF0YShhWzFdKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sXG4gICAgICBfdGlja2VyQWN0aXZlLFxuICAgICAgX3RpY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX2dldFRpbWUgPSBEYXRlLm5vdyxcbiAgICAgICAgX2xhZ1RocmVzaG9sZCA9IDUwMCxcbiAgICAgICAgX2FkanVzdGVkTGFnID0gMzMsXG4gICAgICAgIF9zdGFydFRpbWUgPSBfZ2V0VGltZSgpLFxuICAgICAgICBfbGFzdFVwZGF0ZSA9IF9zdGFydFRpbWUsXG4gICAgICAgIF9nYXAgPSAxMDAwIC8gMjQwLFxuICAgICAgICBfbmV4dFRpbWUgPSBfZ2FwLFxuICAgICAgICBfbGlzdGVuZXJzID0gW10sXG4gICAgICAgIF9pZCxcbiAgICAgICAgX3JlcSxcbiAgICAgICAgX3JhZixcbiAgICAgICAgX3NlbGYsXG4gICAgICAgIF9kZWx0YSxcbiAgICAgICAgX2ksXG4gICAgICAgIF90aWNrID0gZnVuY3Rpb24gX3RpY2sodikge1xuICAgICAgdmFyIGVsYXBzZWQgPSBfZ2V0VGltZSgpIC0gX2xhc3RVcGRhdGUsXG4gICAgICAgICAgbWFudWFsID0gdiA9PT0gdHJ1ZSxcbiAgICAgICAgICBvdmVybGFwLFxuICAgICAgICAgIGRpc3BhdGNoLFxuICAgICAgICAgIHRpbWUsXG4gICAgICAgICAgZnJhbWU7XG5cbiAgICAgIGVsYXBzZWQgPiBfbGFnVGhyZXNob2xkICYmIChfc3RhcnRUaW1lICs9IGVsYXBzZWQgLSBfYWRqdXN0ZWRMYWcpO1xuICAgICAgX2xhc3RVcGRhdGUgKz0gZWxhcHNlZDtcbiAgICAgIHRpbWUgPSBfbGFzdFVwZGF0ZSAtIF9zdGFydFRpbWU7XG4gICAgICBvdmVybGFwID0gdGltZSAtIF9uZXh0VGltZTtcblxuICAgICAgaWYgKG92ZXJsYXAgPiAwIHx8IG1hbnVhbCkge1xuICAgICAgICBmcmFtZSA9ICsrX3NlbGYuZnJhbWU7XG4gICAgICAgIF9kZWx0YSA9IHRpbWUgLSBfc2VsZi50aW1lICogMTAwMDtcbiAgICAgICAgX3NlbGYudGltZSA9IHRpbWUgPSB0aW1lIC8gMTAwMDtcbiAgICAgICAgX25leHRUaW1lICs9IG92ZXJsYXAgKyAob3ZlcmxhcCA+PSBfZ2FwID8gNCA6IF9nYXAgLSBvdmVybGFwKTtcbiAgICAgICAgZGlzcGF0Y2ggPSAxO1xuICAgICAgfVxuXG4gICAgICBtYW51YWwgfHwgKF9pZCA9IF9yZXEoX3RpY2spKTtcblxuICAgICAgaWYgKGRpc3BhdGNoKSB7XG4gICAgICAgIGZvciAoX2kgPSAwOyBfaSA8IF9saXN0ZW5lcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgX2xpc3RlbmVyc1tfaV0odGltZSwgX2RlbHRhLCBmcmFtZSwgdik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYgPSB7XG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICB0aWNrOiBmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgICBfdGljayh0cnVlKTtcbiAgICAgIH0sXG4gICAgICBkZWx0YVJhdGlvOiBmdW5jdGlvbiBkZWx0YVJhdGlvKGZwcykge1xuICAgICAgICByZXR1cm4gX2RlbHRhIC8gKDEwMDAgLyAoZnBzIHx8IDYwKSk7XG4gICAgICB9LFxuICAgICAgd2FrZTogZnVuY3Rpb24gd2FrZSgpIHtcbiAgICAgICAgaWYgKF9jb3JlUmVhZHkpIHtcbiAgICAgICAgICBpZiAoIV9jb3JlSW5pdHRlZCAmJiBfd2luZG93RXhpc3RzKCkpIHtcbiAgICAgICAgICAgIF93aW4gPSBfY29yZUluaXR0ZWQgPSB3aW5kb3c7XG4gICAgICAgICAgICBfZG9jID0gX3dpbi5kb2N1bWVudCB8fCB7fTtcbiAgICAgICAgICAgIF9nbG9iYWxzLmdzYXAgPSBnc2FwO1xuICAgICAgICAgICAgKF93aW4uZ3NhcFZlcnNpb25zIHx8IChfd2luLmdzYXBWZXJzaW9ucyA9IFtdKSkucHVzaChnc2FwLnZlcnNpb24pO1xuXG4gICAgICAgICAgICBfaW5zdGFsbChfaW5zdGFsbFNjb3BlIHx8IF93aW4uR3JlZW5Tb2NrR2xvYmFscyB8fCAhX3dpbi5nc2FwICYmIF93aW4gfHwge30pO1xuXG4gICAgICAgICAgICBfcmFmID0gX3dpbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX2lkICYmIF9zZWxmLnNsZWVwKCk7XG5cbiAgICAgICAgICBfcmVxID0gX3JhZiB8fCBmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZiwgX25leHRUaW1lIC0gX3NlbGYudGltZSAqIDEwMDAgKyAxIHwgMCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIF90aWNrZXJBY3RpdmUgPSAxO1xuXG4gICAgICAgICAgX3RpY2soMik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzbGVlcDogZnVuY3Rpb24gc2xlZXAoKSB7XG4gICAgICAgIChfcmFmID8gX3dpbi5jYW5jZWxBbmltYXRpb25GcmFtZSA6IGNsZWFyVGltZW91dCkoX2lkKTtcbiAgICAgICAgX3RpY2tlckFjdGl2ZSA9IDA7XG4gICAgICAgIF9yZXEgPSBfZW1wdHlGdW5jO1xuICAgICAgfSxcbiAgICAgIGxhZ1Ntb290aGluZzogZnVuY3Rpb24gbGFnU21vb3RoaW5nKHRocmVzaG9sZCwgYWRqdXN0ZWRMYWcpIHtcbiAgICAgICAgX2xhZ1RocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAxIC8gX3RpbnlOdW07XG4gICAgICAgIF9hZGp1c3RlZExhZyA9IE1hdGgubWluKGFkanVzdGVkTGFnLCBfbGFnVGhyZXNob2xkLCAwKTtcbiAgICAgIH0sXG4gICAgICBmcHM6IGZ1bmN0aW9uIGZwcyhfZnBzKSB7XG4gICAgICAgIF9nYXAgPSAxMDAwIC8gKF9mcHMgfHwgMjQwKTtcbiAgICAgICAgX25leHRUaW1lID0gX3NlbGYudGltZSAqIDEwMDAgKyBfZ2FwO1xuICAgICAgfSxcbiAgICAgIGFkZDogZnVuY3Rpb24gYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIF9saXN0ZW5lcnMuaW5kZXhPZihjYWxsYmFjaykgPCAwICYmIF9saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG5cbiAgICAgICAgX3dha2UoKTtcbiAgICAgIH0sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShjYWxsYmFjaywgaSkge1xuICAgICAgICB+KGkgPSBfbGlzdGVuZXJzLmluZGV4T2YoY2FsbGJhY2spKSAmJiBfbGlzdGVuZXJzLnNwbGljZShpLCAxKSAmJiBfaSA+PSBpICYmIF9pLS07XG4gICAgICB9LFxuICAgICAgX2xpc3RlbmVyczogX2xpc3RlbmVyc1xuICAgIH07XG4gICAgcmV0dXJuIF9zZWxmO1xuICB9KCksXG4gICAgICBfd2FrZSA9IGZ1bmN0aW9uIF93YWtlKCkge1xuICAgIHJldHVybiAhX3RpY2tlckFjdGl2ZSAmJiBfdGlja2VyLndha2UoKTtcbiAgfSxcbiAgICAgIF9lYXNlTWFwID0ge30sXG4gICAgICBfY3VzdG9tRWFzZUV4cCA9IC9eW1xcZC5cXC1NXVtcXGQuXFwtLFxcc10vLFxuICAgICAgX3F1b3Rlc0V4cCA9IC9bXCInXS9nLFxuICAgICAgX3BhcnNlT2JqZWN0SW5TdHJpbmcgPSBmdW5jdGlvbiBfcGFyc2VPYmplY3RJblN0cmluZyh2YWx1ZSkge1xuICAgIHZhciBvYmogPSB7fSxcbiAgICAgICAgc3BsaXQgPSB2YWx1ZS5zdWJzdHIoMSwgdmFsdWUubGVuZ3RoIC0gMykuc3BsaXQoXCI6XCIpLFxuICAgICAgICBrZXkgPSBzcGxpdFswXSxcbiAgICAgICAgaSA9IDEsXG4gICAgICAgIGwgPSBzcGxpdC5sZW5ndGgsXG4gICAgICAgIGluZGV4LFxuICAgICAgICB2YWwsXG4gICAgICAgIHBhcnNlZFZhbDtcblxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YWwgPSBzcGxpdFtpXTtcbiAgICAgIGluZGV4ID0gaSAhPT0gbCAtIDEgPyB2YWwubGFzdEluZGV4T2YoXCIsXCIpIDogdmFsLmxlbmd0aDtcbiAgICAgIHBhcnNlZFZhbCA9IHZhbC5zdWJzdHIoMCwgaW5kZXgpO1xuICAgICAgb2JqW2tleV0gPSBpc05hTihwYXJzZWRWYWwpID8gcGFyc2VkVmFsLnJlcGxhY2UoX3F1b3Rlc0V4cCwgXCJcIikudHJpbSgpIDogK3BhcnNlZFZhbDtcbiAgICAgIGtleSA9IHZhbC5zdWJzdHIoaW5kZXggKyAxKS50cmltKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgICAgIF92YWx1ZUluUGFyZW50aGVzZXMgPSBmdW5jdGlvbiBfdmFsdWVJblBhcmVudGhlc2VzKHZhbHVlKSB7XG4gICAgdmFyIG9wZW4gPSB2YWx1ZS5pbmRleE9mKFwiKFwiKSArIDEsXG4gICAgICAgIGNsb3NlID0gdmFsdWUuaW5kZXhPZihcIilcIiksXG4gICAgICAgIG5lc3RlZCA9IHZhbHVlLmluZGV4T2YoXCIoXCIsIG9wZW4pO1xuICAgIHJldHVybiB2YWx1ZS5zdWJzdHJpbmcob3Blbiwgfm5lc3RlZCAmJiBuZXN0ZWQgPCBjbG9zZSA/IHZhbHVlLmluZGV4T2YoXCIpXCIsIGNsb3NlICsgMSkgOiBjbG9zZSk7XG4gIH0sXG4gICAgICBfY29uZmlnRWFzZUZyb21TdHJpbmcgPSBmdW5jdGlvbiBfY29uZmlnRWFzZUZyb21TdHJpbmcobmFtZSkge1xuICAgIHZhciBzcGxpdCA9IChuYW1lICsgXCJcIikuc3BsaXQoXCIoXCIpLFxuICAgICAgICBlYXNlID0gX2Vhc2VNYXBbc3BsaXRbMF1dO1xuICAgIHJldHVybiBlYXNlICYmIHNwbGl0Lmxlbmd0aCA+IDEgJiYgZWFzZS5jb25maWcgPyBlYXNlLmNvbmZpZy5hcHBseShudWxsLCB+bmFtZS5pbmRleE9mKFwie1wiKSA/IFtfcGFyc2VPYmplY3RJblN0cmluZyhzcGxpdFsxXSldIDogX3ZhbHVlSW5QYXJlbnRoZXNlcyhuYW1lKS5zcGxpdChcIixcIikubWFwKF9udW1lcmljSWZQb3NzaWJsZSkpIDogX2Vhc2VNYXAuX0NFICYmIF9jdXN0b21FYXNlRXhwLnRlc3QobmFtZSkgPyBfZWFzZU1hcC5fQ0UoXCJcIiwgbmFtZSkgOiBlYXNlO1xuICB9LFxuICAgICAgX2ludmVydEVhc2UgPSBmdW5jdGlvbiBfaW52ZXJ0RWFzZShlYXNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gMSAtIGVhc2UoMSAtIHApO1xuICAgIH07XG4gIH0sXG4gICAgICBfcHJvcGFnYXRlWW95b0Vhc2UgPSBmdW5jdGlvbiBfcHJvcGFnYXRlWW95b0Vhc2UodGltZWxpbmUsIGlzWW95bykge1xuICAgIHZhciBjaGlsZCA9IHRpbWVsaW5lLl9maXJzdCxcbiAgICAgICAgZWFzZTtcblxuICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgVGltZWxpbmUpIHtcbiAgICAgICAgX3Byb3BhZ2F0ZVlveW9FYXNlKGNoaWxkLCBpc1lveW8pO1xuICAgICAgfSBlbHNlIGlmIChjaGlsZC52YXJzLnlveW9FYXNlICYmICghY2hpbGQuX3lveW8gfHwgIWNoaWxkLl9yZXBlYXQpICYmIGNoaWxkLl95b3lvICE9PSBpc1lveW8pIHtcbiAgICAgICAgaWYgKGNoaWxkLnRpbWVsaW5lKSB7XG4gICAgICAgICAgX3Byb3BhZ2F0ZVlveW9FYXNlKGNoaWxkLnRpbWVsaW5lLCBpc1lveW8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVhc2UgPSBjaGlsZC5fZWFzZTtcbiAgICAgICAgICBjaGlsZC5fZWFzZSA9IGNoaWxkLl95RWFzZTtcbiAgICAgICAgICBjaGlsZC5feUVhc2UgPSBlYXNlO1xuICAgICAgICAgIGNoaWxkLl95b3lvID0gaXNZb3lvO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgfVxuICB9LFxuICAgICAgX3BhcnNlRWFzZSA9IGZ1bmN0aW9uIF9wYXJzZUVhc2UoZWFzZSwgZGVmYXVsdEVhc2UpIHtcbiAgICByZXR1cm4gIWVhc2UgPyBkZWZhdWx0RWFzZSA6IChfaXNGdW5jdGlvbihlYXNlKSA/IGVhc2UgOiBfZWFzZU1hcFtlYXNlXSB8fCBfY29uZmlnRWFzZUZyb21TdHJpbmcoZWFzZSkpIHx8IGRlZmF1bHRFYXNlO1xuICB9LFxuICAgICAgX2luc2VydEVhc2UgPSBmdW5jdGlvbiBfaW5zZXJ0RWFzZShuYW1lcywgZWFzZUluLCBlYXNlT3V0LCBlYXNlSW5PdXQpIHtcbiAgICBpZiAoZWFzZU91dCA9PT0gdm9pZCAwKSB7XG4gICAgICBlYXNlT3V0ID0gZnVuY3Rpb24gZWFzZU91dChwKSB7XG4gICAgICAgIHJldHVybiAxIC0gZWFzZUluKDEgLSBwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGVhc2VJbk91dCA9PT0gdm9pZCAwKSB7XG4gICAgICBlYXNlSW5PdXQgPSBmdW5jdGlvbiBlYXNlSW5PdXQocCkge1xuICAgICAgICByZXR1cm4gcCA8IC41ID8gZWFzZUluKHAgKiAyKSAvIDIgOiAxIC0gZWFzZUluKCgxIC0gcCkgKiAyKSAvIDI7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBlYXNlID0ge1xuICAgICAgZWFzZUluOiBlYXNlSW4sXG4gICAgICBlYXNlT3V0OiBlYXNlT3V0LFxuICAgICAgZWFzZUluT3V0OiBlYXNlSW5PdXRcbiAgICB9LFxuICAgICAgICBsb3dlcmNhc2VOYW1lO1xuXG4gICAgX2ZvckVhY2hOYW1lKG5hbWVzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgX2Vhc2VNYXBbbmFtZV0gPSBfZ2xvYmFsc1tuYW1lXSA9IGVhc2U7XG4gICAgICBfZWFzZU1hcFtsb3dlcmNhc2VOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXSA9IGVhc2VPdXQ7XG5cbiAgICAgIGZvciAodmFyIHAgaW4gZWFzZSkge1xuICAgICAgICBfZWFzZU1hcFtsb3dlcmNhc2VOYW1lICsgKHAgPT09IFwiZWFzZUluXCIgPyBcIi5pblwiIDogcCA9PT0gXCJlYXNlT3V0XCIgPyBcIi5vdXRcIiA6IFwiLmluT3V0XCIpXSA9IF9lYXNlTWFwW25hbWUgKyBcIi5cIiArIHBdID0gZWFzZVtwXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBlYXNlO1xuICB9LFxuICAgICAgX2Vhc2VJbk91dEZyb21PdXQgPSBmdW5jdGlvbiBfZWFzZUluT3V0RnJvbU91dChlYXNlT3V0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcCA8IC41ID8gKDEgLSBlYXNlT3V0KDEgLSBwICogMikpIC8gMiA6IC41ICsgZWFzZU91dCgocCAtIC41KSAqIDIpIC8gMjtcbiAgICB9O1xuICB9LFxuICAgICAgX2NvbmZpZ0VsYXN0aWMgPSBmdW5jdGlvbiBfY29uZmlnRWxhc3RpYyh0eXBlLCBhbXBsaXR1ZGUsIHBlcmlvZCkge1xuICAgIHZhciBwMSA9IGFtcGxpdHVkZSA+PSAxID8gYW1wbGl0dWRlIDogMSxcbiAgICAgICAgcDIgPSAocGVyaW9kIHx8ICh0eXBlID8gLjMgOiAuNDUpKSAvIChhbXBsaXR1ZGUgPCAxID8gYW1wbGl0dWRlIDogMSksXG4gICAgICAgIHAzID0gcDIgLyBfMlBJICogKE1hdGguYXNpbigxIC8gcDEpIHx8IDApLFxuICAgICAgICBlYXNlT3V0ID0gZnVuY3Rpb24gZWFzZU91dChwKSB7XG4gICAgICByZXR1cm4gcCA9PT0gMSA/IDEgOiBwMSAqIE1hdGgucG93KDIsIC0xMCAqIHApICogX3NpbigocCAtIHAzKSAqIHAyKSArIDE7XG4gICAgfSxcbiAgICAgICAgZWFzZSA9IHR5cGUgPT09IFwib3V0XCIgPyBlYXNlT3V0IDogdHlwZSA9PT0gXCJpblwiID8gZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAxIC0gZWFzZU91dCgxIC0gcCk7XG4gICAgfSA6IF9lYXNlSW5PdXRGcm9tT3V0KGVhc2VPdXQpO1xuXG4gICAgcDIgPSBfMlBJIC8gcDI7XG5cbiAgICBlYXNlLmNvbmZpZyA9IGZ1bmN0aW9uIChhbXBsaXR1ZGUsIHBlcmlvZCkge1xuICAgICAgcmV0dXJuIF9jb25maWdFbGFzdGljKHR5cGUsIGFtcGxpdHVkZSwgcGVyaW9kKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGVhc2U7XG4gIH0sXG4gICAgICBfY29uZmlnQmFjayA9IGZ1bmN0aW9uIF9jb25maWdCYWNrKHR5cGUsIG92ZXJzaG9vdCkge1xuICAgIGlmIChvdmVyc2hvb3QgPT09IHZvaWQgMCkge1xuICAgICAgb3ZlcnNob290ID0gMS43MDE1ODtcbiAgICB9XG5cbiAgICB2YXIgZWFzZU91dCA9IGZ1bmN0aW9uIGVhc2VPdXQocCkge1xuICAgICAgcmV0dXJuIHAgPyAtLXAgKiBwICogKChvdmVyc2hvb3QgKyAxKSAqIHAgKyBvdmVyc2hvb3QpICsgMSA6IDA7XG4gICAgfSxcbiAgICAgICAgZWFzZSA9IHR5cGUgPT09IFwib3V0XCIgPyBlYXNlT3V0IDogdHlwZSA9PT0gXCJpblwiID8gZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAxIC0gZWFzZU91dCgxIC0gcCk7XG4gICAgfSA6IF9lYXNlSW5PdXRGcm9tT3V0KGVhc2VPdXQpO1xuXG4gICAgZWFzZS5jb25maWcgPSBmdW5jdGlvbiAob3ZlcnNob290KSB7XG4gICAgICByZXR1cm4gX2NvbmZpZ0JhY2sodHlwZSwgb3ZlcnNob290KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGVhc2U7XG4gIH07XG5cbiAgX2ZvckVhY2hOYW1lKFwiTGluZWFyLFF1YWQsQ3ViaWMsUXVhcnQsUXVpbnQsU3Ryb25nXCIsIGZ1bmN0aW9uIChuYW1lLCBpKSB7XG4gICAgdmFyIHBvd2VyID0gaSA8IDUgPyBpICsgMSA6IGk7XG5cbiAgICBfaW5zZXJ0RWFzZShuYW1lICsgXCIsUG93ZXJcIiArIChwb3dlciAtIDEpLCBpID8gZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBNYXRoLnBvdyhwLCBwb3dlcik7XG4gICAgfSA6IGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcDtcbiAgICB9LCBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdygxIC0gcCwgcG93ZXIpO1xuICAgIH0sIGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcCA8IC41ID8gTWF0aC5wb3cocCAqIDIsIHBvd2VyKSAvIDIgOiAxIC0gTWF0aC5wb3coKDEgLSBwKSAqIDIsIHBvd2VyKSAvIDI7XG4gICAgfSk7XG4gIH0pO1xuXG4gIF9lYXNlTWFwLkxpbmVhci5lYXNlTm9uZSA9IF9lYXNlTWFwLm5vbmUgPSBfZWFzZU1hcC5MaW5lYXIuZWFzZUluO1xuXG4gIF9pbnNlcnRFYXNlKFwiRWxhc3RpY1wiLCBfY29uZmlnRWxhc3RpYyhcImluXCIpLCBfY29uZmlnRWxhc3RpYyhcIm91dFwiKSwgX2NvbmZpZ0VsYXN0aWMoKSk7XG5cbiAgKGZ1bmN0aW9uIChuLCBjKSB7XG4gICAgdmFyIG4xID0gMSAvIGMsXG4gICAgICAgIG4yID0gMiAqIG4xLFxuICAgICAgICBuMyA9IDIuNSAqIG4xLFxuICAgICAgICBlYXNlT3V0ID0gZnVuY3Rpb24gZWFzZU91dChwKSB7XG4gICAgICByZXR1cm4gcCA8IG4xID8gbiAqIHAgKiBwIDogcCA8IG4yID8gbiAqIE1hdGgucG93KHAgLSAxLjUgLyBjLCAyKSArIC43NSA6IHAgPCBuMyA/IG4gKiAocCAtPSAyLjI1IC8gYykgKiBwICsgLjkzNzUgOiBuICogTWF0aC5wb3cocCAtIDIuNjI1IC8gYywgMikgKyAuOTg0Mzc1O1xuICAgIH07XG5cbiAgICBfaW5zZXJ0RWFzZShcIkJvdW5jZVwiLCBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIDEgLSBlYXNlT3V0KDEgLSBwKTtcbiAgICB9LCBlYXNlT3V0KTtcbiAgfSkoNy41NjI1LCAyLjc1KTtcblxuICBfaW5zZXJ0RWFzZShcIkV4cG9cIiwgZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcCA/IE1hdGgucG93KDIsIDEwICogKHAgLSAxKSkgOiAwO1xuICB9KTtcblxuICBfaW5zZXJ0RWFzZShcIkNpcmNcIiwgZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gLShfc3FydCgxIC0gcCAqIHApIC0gMSk7XG4gIH0pO1xuXG4gIF9pbnNlcnRFYXNlKFwiU2luZVwiLCBmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiBwID09PSAxID8gMSA6IC1fY29zKHAgKiBfSEFMRl9QSSkgKyAxO1xuICB9KTtcblxuICBfaW5zZXJ0RWFzZShcIkJhY2tcIiwgX2NvbmZpZ0JhY2soXCJpblwiKSwgX2NvbmZpZ0JhY2soXCJvdXRcIiksIF9jb25maWdCYWNrKCkpO1xuXG4gIF9lYXNlTWFwLlN0ZXBwZWRFYXNlID0gX2Vhc2VNYXAuc3RlcHMgPSBfZ2xvYmFscy5TdGVwcGVkRWFzZSA9IHtcbiAgICBjb25maWc6IGZ1bmN0aW9uIGNvbmZpZyhzdGVwcywgaW1tZWRpYXRlU3RhcnQpIHtcbiAgICAgIGlmIChzdGVwcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHN0ZXBzID0gMTtcbiAgICAgIH1cblxuICAgICAgdmFyIHAxID0gMSAvIHN0ZXBzLFxuICAgICAgICAgIHAyID0gc3RlcHMgKyAoaW1tZWRpYXRlU3RhcnQgPyAwIDogMSksXG4gICAgICAgICAgcDMgPSBpbW1lZGlhdGVTdGFydCA/IDEgOiAwLFxuICAgICAgICAgIG1heCA9IDEgLSBfdGlueU51bTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gKChwMiAqIF9jbGFtcCgwLCBtYXgsIHApIHwgMCkgKyBwMykgKiBwMTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICBfZGVmYXVsdHMuZWFzZSA9IF9lYXNlTWFwW1wicXVhZC5vdXRcIl07XG5cbiAgX2ZvckVhY2hOYW1lKFwib25Db21wbGV0ZSxvblVwZGF0ZSxvblN0YXJ0LG9uUmVwZWF0LG9uUmV2ZXJzZUNvbXBsZXRlLG9uSW50ZXJydXB0XCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIF9jYWxsYmFja05hbWVzICs9IG5hbWUgKyBcIixcIiArIG5hbWUgKyBcIlBhcmFtcyxcIjtcbiAgfSk7XG5cbiAgdmFyIEdTQ2FjaGUgPSBmdW5jdGlvbiBHU0NhY2hlKHRhcmdldCwgaGFybmVzcykge1xuICAgIHRoaXMuaWQgPSBfZ3NJRCsrO1xuICAgIHRhcmdldC5fZ3NhcCA9IHRoaXM7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5oYXJuZXNzID0gaGFybmVzcztcbiAgICB0aGlzLmdldCA9IGhhcm5lc3MgPyBoYXJuZXNzLmdldCA6IF9nZXRQcm9wZXJ0eTtcbiAgICB0aGlzLnNldCA9IGhhcm5lc3MgPyBoYXJuZXNzLmdldFNldHRlciA6IF9nZXRTZXR0ZXI7XG4gIH07XG4gIHZhciBBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQW5pbWF0aW9uKHZhcnMpIHtcbiAgICAgIHRoaXMudmFycyA9IHZhcnM7XG4gICAgICB0aGlzLl9kZWxheSA9ICt2YXJzLmRlbGF5IHx8IDA7XG5cbiAgICAgIGlmICh0aGlzLl9yZXBlYXQgPSB2YXJzLnJlcGVhdCA9PT0gSW5maW5pdHkgPyAtMiA6IHZhcnMucmVwZWF0IHx8IDApIHtcbiAgICAgICAgdGhpcy5fckRlbGF5ID0gdmFycy5yZXBlYXREZWxheSB8fCAwO1xuICAgICAgICB0aGlzLl95b3lvID0gISF2YXJzLnlveW8gfHwgISF2YXJzLnlveW9FYXNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90cyA9IDE7XG5cbiAgICAgIF9zZXREdXJhdGlvbih0aGlzLCArdmFycy5kdXJhdGlvbiwgMSwgMSk7XG5cbiAgICAgIHRoaXMuZGF0YSA9IHZhcnMuZGF0YTtcbiAgICAgIF90aWNrZXJBY3RpdmUgfHwgX3RpY2tlci53YWtlKCk7XG4gICAgfVxuXG4gICAgdmFyIF9wcm90byA9IEFuaW1hdGlvbi5wcm90b3R5cGU7XG5cbiAgICBfcHJvdG8uZGVsYXkgPSBmdW5jdGlvbiBkZWxheSh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIHx8IHZhbHVlID09PSAwKSB7XG4gICAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LnNtb290aENoaWxkVGltaW5nICYmIHRoaXMuc3RhcnRUaW1lKHRoaXMuX3N0YXJ0ICsgdmFsdWUgLSB0aGlzLl9kZWxheSk7XG4gICAgICAgIHRoaXMuX2RlbGF5ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fZGVsYXk7XG4gICAgfTtcblxuICAgIF9wcm90by5kdXJhdGlvbiA9IGZ1bmN0aW9uIGR1cmF0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMudG90YWxEdXJhdGlvbih0aGlzLl9yZXBlYXQgPiAwID8gdmFsdWUgKyAodmFsdWUgKyB0aGlzLl9yRGVsYXkpICogdGhpcy5fcmVwZWF0IDogdmFsdWUpIDogdGhpcy50b3RhbER1cmF0aW9uKCkgJiYgdGhpcy5fZHVyO1xuICAgIH07XG5cbiAgICBfcHJvdG8udG90YWxEdXJhdGlvbiA9IGZ1bmN0aW9uIHRvdGFsRHVyYXRpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdER1cjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGlydHkgPSAwO1xuICAgICAgcmV0dXJuIF9zZXREdXJhdGlvbih0aGlzLCB0aGlzLl9yZXBlYXQgPCAwID8gdmFsdWUgOiAodmFsdWUgLSB0aGlzLl9yZXBlYXQgKiB0aGlzLl9yRGVsYXkpIC8gKHRoaXMuX3JlcGVhdCArIDEpKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRvdGFsVGltZSA9IGZ1bmN0aW9uIHRvdGFsVGltZShfdG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgX3dha2UoKTtcblxuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90VGltZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX2RwO1xuXG4gICAgICBpZiAocGFyZW50ICYmIHBhcmVudC5zbW9vdGhDaGlsZFRpbWluZyAmJiB0aGlzLl90cykge1xuICAgICAgICBfYWxpZ25QbGF5aGVhZCh0aGlzLCBfdG90YWxUaW1lKTtcblxuICAgICAgICAhcGFyZW50Ll9kcCB8fCBwYXJlbnQucGFyZW50IHx8IF9wb3N0QWRkQ2hlY2tzKHBhcmVudCwgdGhpcyk7XG5cbiAgICAgICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQucGFyZW50KSB7XG4gICAgICAgICAgaWYgKHBhcmVudC5wYXJlbnQuX3RpbWUgIT09IHBhcmVudC5fc3RhcnQgKyAocGFyZW50Ll90cyA+PSAwID8gcGFyZW50Ll90VGltZSAvIHBhcmVudC5fdHMgOiAocGFyZW50LnRvdGFsRHVyYXRpb24oKSAtIHBhcmVudC5fdFRpbWUpIC8gLXBhcmVudC5fdHMpKSB7XG4gICAgICAgICAgICBwYXJlbnQudG90YWxUaW1lKHBhcmVudC5fdFRpbWUsIHRydWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucGFyZW50ICYmIHRoaXMuX2RwLmF1dG9SZW1vdmVDaGlsZHJlbiAmJiAodGhpcy5fdHMgPiAwICYmIF90b3RhbFRpbWUgPCB0aGlzLl90RHVyIHx8IHRoaXMuX3RzIDwgMCAmJiBfdG90YWxUaW1lID4gMCB8fCAhdGhpcy5fdER1ciAmJiAhX3RvdGFsVGltZSkpIHtcbiAgICAgICAgICBfYWRkVG9UaW1lbGluZSh0aGlzLl9kcCwgdGhpcywgdGhpcy5fc3RhcnQgLSB0aGlzLl9kZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3RUaW1lICE9PSBfdG90YWxUaW1lIHx8ICF0aGlzLl9kdXIgJiYgIXN1cHByZXNzRXZlbnRzIHx8IHRoaXMuX2luaXR0ZWQgJiYgTWF0aC5hYnModGhpcy5felRpbWUpID09PSBfdGlueU51bSB8fCAhX3RvdGFsVGltZSAmJiAhdGhpcy5faW5pdHRlZCAmJiAodGhpcy5hZGQgfHwgdGhpcy5fcHRMb29rdXApKSB7XG4gICAgICAgIHRoaXMuX3RzIHx8ICh0aGlzLl9wVGltZSA9IF90b3RhbFRpbWUpO1xuXG4gICAgICAgIF9sYXp5U2FmZVJlbmRlcih0aGlzLCBfdG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8udGltZSA9IGZ1bmN0aW9uIHRpbWUodmFsdWUsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMudG90YWxUaW1lKE1hdGgubWluKHRoaXMudG90YWxEdXJhdGlvbigpLCB2YWx1ZSArIF9lbGFwc2VkQ3ljbGVEdXJhdGlvbih0aGlzKSkgJSAodGhpcy5fZHVyICsgdGhpcy5fckRlbGF5KSB8fCAodmFsdWUgPyB0aGlzLl9kdXIgOiAwKSwgc3VwcHJlc3NFdmVudHMpIDogdGhpcy5fdGltZTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRvdGFsUHJvZ3Jlc3MgPSBmdW5jdGlvbiB0b3RhbFByb2dyZXNzKHZhbHVlLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRvdGFsVGltZSh0aGlzLnRvdGFsRHVyYXRpb24oKSAqIHZhbHVlLCBzdXBwcmVzc0V2ZW50cykgOiB0aGlzLnRvdGFsRHVyYXRpb24oKSA/IE1hdGgubWluKDEsIHRoaXMuX3RUaW1lIC8gdGhpcy5fdER1cikgOiB0aGlzLnJhdGlvO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucHJvZ3Jlc3MgPSBmdW5jdGlvbiBwcm9ncmVzcyh2YWx1ZSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy50b3RhbFRpbWUodGhpcy5kdXJhdGlvbigpICogKHRoaXMuX3lveW8gJiYgISh0aGlzLml0ZXJhdGlvbigpICYgMSkgPyAxIC0gdmFsdWUgOiB2YWx1ZSkgKyBfZWxhcHNlZEN5Y2xlRHVyYXRpb24odGhpcyksIHN1cHByZXNzRXZlbnRzKSA6IHRoaXMuZHVyYXRpb24oKSA/IE1hdGgubWluKDEsIHRoaXMuX3RpbWUgLyB0aGlzLl9kdXIpIDogdGhpcy5yYXRpbztcbiAgICB9O1xuXG4gICAgX3Byb3RvLml0ZXJhdGlvbiA9IGZ1bmN0aW9uIGl0ZXJhdGlvbih2YWx1ZSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIHZhciBjeWNsZUR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbigpICsgdGhpcy5fckRlbGF5O1xuXG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMudG90YWxUaW1lKHRoaXMuX3RpbWUgKyAodmFsdWUgLSAxKSAqIGN5Y2xlRHVyYXRpb24sIHN1cHByZXNzRXZlbnRzKSA6IHRoaXMuX3JlcGVhdCA/IF9hbmltYXRpb25DeWNsZSh0aGlzLl90VGltZSwgY3ljbGVEdXJhdGlvbikgKyAxIDogMTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRpbWVTY2FsZSA9IGZ1bmN0aW9uIHRpbWVTY2FsZSh2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ydHMgPT09IC1fdGlueU51bSA/IDAgOiB0aGlzLl9ydHM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ydHMgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgdFRpbWUgPSB0aGlzLnBhcmVudCAmJiB0aGlzLl90cyA/IF9wYXJlbnRUb0NoaWxkVG90YWxUaW1lKHRoaXMucGFyZW50Ll90aW1lLCB0aGlzKSA6IHRoaXMuX3RUaW1lO1xuICAgICAgdGhpcy5fcnRzID0gK3ZhbHVlIHx8IDA7XG4gICAgICB0aGlzLl90cyA9IHRoaXMuX3BzIHx8IHZhbHVlID09PSAtX3RpbnlOdW0gPyAwIDogdGhpcy5fcnRzO1xuXG4gICAgICBfcmVjYWNoZUFuY2VzdG9ycyh0aGlzLnRvdGFsVGltZShfY2xhbXAoLXRoaXMuX2RlbGF5LCB0aGlzLl90RHVyLCB0VGltZSksIHRydWUpKTtcblxuICAgICAgX3NldEVuZCh0aGlzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90by5wYXVzZWQgPSBmdW5jdGlvbiBwYXVzZWQodmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wcyAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcHMgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLl9wVGltZSA9IHRoaXMuX3RUaW1lIHx8IE1hdGgubWF4KC10aGlzLl9kZWxheSwgdGhpcy5yYXdUaW1lKCkpO1xuICAgICAgICAgIHRoaXMuX3RzID0gdGhpcy5fYWN0ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfd2FrZSgpO1xuXG4gICAgICAgICAgdGhpcy5fdHMgPSB0aGlzLl9ydHM7XG4gICAgICAgICAgdGhpcy50b3RhbFRpbWUodGhpcy5wYXJlbnQgJiYgIXRoaXMucGFyZW50LnNtb290aENoaWxkVGltaW5nID8gdGhpcy5yYXdUaW1lKCkgOiB0aGlzLl90VGltZSB8fCB0aGlzLl9wVGltZSwgdGhpcy5wcm9ncmVzcygpID09PSAxICYmIE1hdGguYWJzKHRoaXMuX3pUaW1lKSAhPT0gX3RpbnlOdW0gJiYgKHRoaXMuX3RUaW1lIC09IF90aW55TnVtKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90by5zdGFydFRpbWUgPSBmdW5jdGlvbiBzdGFydFRpbWUodmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0ID0gdmFsdWU7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzLl9kcDtcbiAgICAgICAgcGFyZW50ICYmIChwYXJlbnQuX3NvcnQgfHwgIXRoaXMucGFyZW50KSAmJiBfYWRkVG9UaW1lbGluZShwYXJlbnQsIHRoaXMsIHZhbHVlIC0gdGhpcy5fZGVsYXkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0O1xuICAgIH07XG5cbiAgICBfcHJvdG8uZW5kVGltZSA9IGZ1bmN0aW9uIGVuZFRpbWUoaW5jbHVkZVJlcGVhdHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGFydCArIChfaXNOb3RGYWxzZShpbmNsdWRlUmVwZWF0cykgPyB0aGlzLnRvdGFsRHVyYXRpb24oKSA6IHRoaXMuZHVyYXRpb24oKSkgLyBNYXRoLmFicyh0aGlzLl90cyB8fCAxKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnJhd1RpbWUgPSBmdW5jdGlvbiByYXdUaW1lKHdyYXBSZXBlYXRzKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQgfHwgdGhpcy5fZHA7XG4gICAgICByZXR1cm4gIXBhcmVudCA/IHRoaXMuX3RUaW1lIDogd3JhcFJlcGVhdHMgJiYgKCF0aGlzLl90cyB8fCB0aGlzLl9yZXBlYXQgJiYgdGhpcy5fdGltZSAmJiB0aGlzLnRvdGFsUHJvZ3Jlc3MoKSA8IDEpID8gdGhpcy5fdFRpbWUgJSAodGhpcy5fZHVyICsgdGhpcy5fckRlbGF5KSA6ICF0aGlzLl90cyA/IHRoaXMuX3RUaW1lIDogX3BhcmVudFRvQ2hpbGRUb3RhbFRpbWUocGFyZW50LnJhd1RpbWUod3JhcFJlcGVhdHMpLCB0aGlzKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLmdsb2JhbFRpbWUgPSBmdW5jdGlvbiBnbG9iYWxUaW1lKHJhd1RpbWUpIHtcbiAgICAgIHZhciBhbmltYXRpb24gPSB0aGlzLFxuICAgICAgICAgIHRpbWUgPSBhcmd1bWVudHMubGVuZ3RoID8gcmF3VGltZSA6IGFuaW1hdGlvbi5yYXdUaW1lKCk7XG5cbiAgICAgIHdoaWxlIChhbmltYXRpb24pIHtcbiAgICAgICAgdGltZSA9IGFuaW1hdGlvbi5fc3RhcnQgKyB0aW1lIC8gKGFuaW1hdGlvbi5fdHMgfHwgMSk7XG4gICAgICAgIGFuaW1hdGlvbiA9IGFuaW1hdGlvbi5fZHA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aW1lO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucmVwZWF0ID0gZnVuY3Rpb24gcmVwZWF0KHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9yZXBlYXQgPSB2YWx1ZSA9PT0gSW5maW5pdHkgPyAtMiA6IHZhbHVlO1xuICAgICAgICByZXR1cm4gX29uVXBkYXRlVG90YWxEdXJhdGlvbih0aGlzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3JlcGVhdCA9PT0gLTIgPyBJbmZpbml0eSA6IHRoaXMuX3JlcGVhdDtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnJlcGVhdERlbGF5ID0gZnVuY3Rpb24gcmVwZWF0RGVsYXkodmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHZhciB0aW1lID0gdGhpcy5fdGltZTtcbiAgICAgICAgdGhpcy5fckRlbGF5ID0gdmFsdWU7XG5cbiAgICAgICAgX29uVXBkYXRlVG90YWxEdXJhdGlvbih0aGlzKTtcblxuICAgICAgICByZXR1cm4gdGltZSA/IHRoaXMudGltZSh0aW1lKSA6IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9yRGVsYXk7XG4gICAgfTtcblxuICAgIF9wcm90by55b3lvID0gZnVuY3Rpb24geW95byh2YWx1ZSkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5feW95byA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3lveW87XG4gICAgfTtcblxuICAgIF9wcm90by5zZWVrID0gZnVuY3Rpb24gc2Vlayhwb3NpdGlvbiwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvdGFsVGltZShfcGFyc2VQb3NpdGlvbih0aGlzLCBwb3NpdGlvbiksIF9pc05vdEZhbHNlKHN1cHByZXNzRXZlbnRzKSk7XG4gICAgfTtcblxuICAgIF9wcm90by5yZXN0YXJ0ID0gZnVuY3Rpb24gcmVzdGFydChpbmNsdWRlRGVsYXksIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wbGF5KCkudG90YWxUaW1lKGluY2x1ZGVEZWxheSA/IC10aGlzLl9kZWxheSA6IDAsIF9pc05vdEZhbHNlKHN1cHByZXNzRXZlbnRzKSk7XG4gICAgfTtcblxuICAgIF9wcm90by5wbGF5ID0gZnVuY3Rpb24gcGxheShmcm9tLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgZnJvbSAhPSBudWxsICYmIHRoaXMuc2Vlayhmcm9tLCBzdXBwcmVzc0V2ZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXZlcnNlZChmYWxzZSkucGF1c2VkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnJldmVyc2UgPSBmdW5jdGlvbiByZXZlcnNlKGZyb20sIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICBmcm9tICE9IG51bGwgJiYgdGhpcy5zZWVrKGZyb20gfHwgdGhpcy50b3RhbER1cmF0aW9uKCksIHN1cHByZXNzRXZlbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLnJldmVyc2VkKHRydWUpLnBhdXNlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIF9wcm90by5wYXVzZSA9IGZ1bmN0aW9uIHBhdXNlKGF0VGltZSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIGF0VGltZSAhPSBudWxsICYmIHRoaXMuc2VlayhhdFRpbWUsIHN1cHByZXNzRXZlbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnJlc3VtZSA9IGZ1bmN0aW9uIHJlc3VtZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIF9wcm90by5yZXZlcnNlZCA9IGZ1bmN0aW9uIHJldmVyc2VkKHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAhIXZhbHVlICE9PSB0aGlzLnJldmVyc2VkKCkgJiYgdGhpcy50aW1lU2NhbGUoLXRoaXMuX3J0cyB8fCAodmFsdWUgPyAtX3RpbnlOdW0gOiAwKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fcnRzIDwgMDtcbiAgICB9O1xuXG4gICAgX3Byb3RvLmludmFsaWRhdGUgPSBmdW5jdGlvbiBpbnZhbGlkYXRlKCkge1xuICAgICAgdGhpcy5faW5pdHRlZCA9IHRoaXMuX2FjdCA9IDA7XG4gICAgICB0aGlzLl96VGltZSA9IC1fdGlueU51bTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8uaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzLl9kcCxcbiAgICAgICAgICBzdGFydCA9IHRoaXMuX3N0YXJ0LFxuICAgICAgICAgIHJhd1RpbWU7XG4gICAgICByZXR1cm4gISEoIXBhcmVudCB8fCB0aGlzLl90cyAmJiB0aGlzLl9pbml0dGVkICYmIHBhcmVudC5pc0FjdGl2ZSgpICYmIChyYXdUaW1lID0gcGFyZW50LnJhd1RpbWUodHJ1ZSkpID49IHN0YXJ0ICYmIHJhd1RpbWUgPCB0aGlzLmVuZFRpbWUodHJ1ZSkgLSBfdGlueU51bSk7XG4gICAgfTtcblxuICAgIF9wcm90by5ldmVudENhbGxiYWNrID0gZnVuY3Rpb24gZXZlbnRDYWxsYmFjayh0eXBlLCBjYWxsYmFjaywgcGFyYW1zKSB7XG4gICAgICB2YXIgdmFycyA9IHRoaXMudmFycztcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICBkZWxldGUgdmFyc1t0eXBlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXJzW3R5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgICAgcGFyYW1zICYmICh2YXJzW3R5cGUgKyBcIlBhcmFtc1wiXSA9IHBhcmFtcyk7XG4gICAgICAgICAgdHlwZSA9PT0gXCJvblVwZGF0ZVwiICYmICh0aGlzLl9vblVwZGF0ZSA9IGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFyc1t0eXBlXTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRoZW4gPSBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgdmFyIGYgPSBfaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IF9wYXNzVGhyb3VnaCxcbiAgICAgICAgICAgIF9yZXNvbHZlID0gZnVuY3Rpb24gX3Jlc29sdmUoKSB7XG4gICAgICAgICAgdmFyIF90aGVuID0gc2VsZi50aGVuO1xuICAgICAgICAgIHNlbGYudGhlbiA9IG51bGw7XG4gICAgICAgICAgX2lzRnVuY3Rpb24oZikgJiYgKGYgPSBmKHNlbGYpKSAmJiAoZi50aGVuIHx8IGYgPT09IHNlbGYpICYmIChzZWxmLnRoZW4gPSBfdGhlbik7XG4gICAgICAgICAgcmVzb2x2ZShmKTtcbiAgICAgICAgICBzZWxmLnRoZW4gPSBfdGhlbjtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoc2VsZi5faW5pdHRlZCAmJiBzZWxmLnRvdGFsUHJvZ3Jlc3MoKSA9PT0gMSAmJiBzZWxmLl90cyA+PSAwIHx8ICFzZWxmLl90VGltZSAmJiBzZWxmLl90cyA8IDApIHtcbiAgICAgICAgICBfcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuX3Byb20gPSBfcmVzb2x2ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9wcm90by5raWxsID0gZnVuY3Rpb24ga2lsbCgpIHtcbiAgICAgIF9pbnRlcnJ1cHQodGhpcyk7XG4gICAgfTtcblxuICAgIHJldHVybiBBbmltYXRpb247XG4gIH0oKTtcblxuICBfc2V0RGVmYXVsdHMoQW5pbWF0aW9uLnByb3RvdHlwZSwge1xuICAgIF90aW1lOiAwLFxuICAgIF9zdGFydDogMCxcbiAgICBfZW5kOiAwLFxuICAgIF90VGltZTogMCxcbiAgICBfdER1cjogMCxcbiAgICBfZGlydHk6IDAsXG4gICAgX3JlcGVhdDogMCxcbiAgICBfeW95bzogZmFsc2UsXG4gICAgcGFyZW50OiBudWxsLFxuICAgIF9pbml0dGVkOiBmYWxzZSxcbiAgICBfckRlbGF5OiAwLFxuICAgIF90czogMSxcbiAgICBfZHA6IDAsXG4gICAgcmF0aW86IDAsXG4gICAgX3pUaW1lOiAtX3RpbnlOdW0sXG4gICAgX3Byb206IDAsXG4gICAgX3BzOiBmYWxzZSxcbiAgICBfcnRzOiAxXG4gIH0pO1xuXG4gIHZhciBUaW1lbGluZSA9IGZ1bmN0aW9uIChfQW5pbWF0aW9uKSB7XG4gICAgX2luaGVyaXRzTG9vc2UoVGltZWxpbmUsIF9BbmltYXRpb24pO1xuXG4gICAgZnVuY3Rpb24gVGltZWxpbmUodmFycywgcG9zaXRpb24pIHtcbiAgICAgIHZhciBfdGhpcztcblxuICAgICAgaWYgKHZhcnMgPT09IHZvaWQgMCkge1xuICAgICAgICB2YXJzID0ge307XG4gICAgICB9XG5cbiAgICAgIF90aGlzID0gX0FuaW1hdGlvbi5jYWxsKHRoaXMsIHZhcnMpIHx8IHRoaXM7XG4gICAgICBfdGhpcy5sYWJlbHMgPSB7fTtcbiAgICAgIF90aGlzLnNtb290aENoaWxkVGltaW5nID0gISF2YXJzLnNtb290aENoaWxkVGltaW5nO1xuICAgICAgX3RoaXMuYXV0b1JlbW92ZUNoaWxkcmVuID0gISF2YXJzLmF1dG9SZW1vdmVDaGlsZHJlbjtcbiAgICAgIF90aGlzLl9zb3J0ID0gX2lzTm90RmFsc2UodmFycy5zb3J0Q2hpbGRyZW4pO1xuICAgICAgX2dsb2JhbFRpbWVsaW5lICYmIF9hZGRUb1RpbWVsaW5lKHZhcnMucGFyZW50IHx8IF9nbG9iYWxUaW1lbGluZSwgX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIHBvc2l0aW9uKTtcbiAgICAgIHZhcnMucmV2ZXJzZWQgJiYgX3RoaXMucmV2ZXJzZSgpO1xuICAgICAgdmFycy5wYXVzZWQgJiYgX3RoaXMucGF1c2VkKHRydWUpO1xuICAgICAgdmFycy5zY3JvbGxUcmlnZ2VyICYmIF9zY3JvbGxUcmlnZ2VyKF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCB2YXJzLnNjcm9sbFRyaWdnZXIpO1xuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIHZhciBfcHJvdG8yID0gVGltZWxpbmUucHJvdG90eXBlO1xuXG4gICAgX3Byb3RvMi50byA9IGZ1bmN0aW9uIHRvKHRhcmdldHMsIHZhcnMsIHBvc2l0aW9uKSB7XG4gICAgICBfY3JlYXRlVHdlZW5UeXBlKDAsIGFyZ3VtZW50cywgdGhpcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmZyb20gPSBmdW5jdGlvbiBmcm9tKHRhcmdldHMsIHZhcnMsIHBvc2l0aW9uKSB7XG4gICAgICBfY3JlYXRlVHdlZW5UeXBlKDEsIGFyZ3VtZW50cywgdGhpcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmZyb21UbyA9IGZ1bmN0aW9uIGZyb21Ubyh0YXJnZXRzLCBmcm9tVmFycywgdG9WYXJzLCBwb3NpdGlvbikge1xuICAgICAgX2NyZWF0ZVR3ZWVuVHlwZSgyLCBhcmd1bWVudHMsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5zZXQgPSBmdW5jdGlvbiBzZXQodGFyZ2V0cywgdmFycywgcG9zaXRpb24pIHtcbiAgICAgIHZhcnMuZHVyYXRpb24gPSAwO1xuICAgICAgdmFycy5wYXJlbnQgPSB0aGlzO1xuICAgICAgX2luaGVyaXREZWZhdWx0cyh2YXJzKS5yZXBlYXREZWxheSB8fCAodmFycy5yZXBlYXQgPSAwKTtcbiAgICAgIHZhcnMuaW1tZWRpYXRlUmVuZGVyID0gISF2YXJzLmltbWVkaWF0ZVJlbmRlcjtcbiAgICAgIG5ldyBUd2Vlbih0YXJnZXRzLCB2YXJzLCBfcGFyc2VQb3NpdGlvbih0aGlzLCBwb3NpdGlvbiksIDEpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIuY2FsbCA9IGZ1bmN0aW9uIGNhbGwoY2FsbGJhY2ssIHBhcmFtcywgcG9zaXRpb24pIHtcbiAgICAgIHJldHVybiBfYWRkVG9UaW1lbGluZSh0aGlzLCBUd2Vlbi5kZWxheWVkQ2FsbCgwLCBjYWxsYmFjaywgcGFyYW1zKSwgcG9zaXRpb24pO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnN0YWdnZXJUbyA9IGZ1bmN0aW9uIHN0YWdnZXJUbyh0YXJnZXRzLCBkdXJhdGlvbiwgdmFycywgc3RhZ2dlciwgcG9zaXRpb24sIG9uQ29tcGxldGVBbGwsIG9uQ29tcGxldGVBbGxQYXJhbXMpIHtcbiAgICAgIHZhcnMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIHZhcnMuc3RhZ2dlciA9IHZhcnMuc3RhZ2dlciB8fCBzdGFnZ2VyO1xuICAgICAgdmFycy5vbkNvbXBsZXRlID0gb25Db21wbGV0ZUFsbDtcbiAgICAgIHZhcnMub25Db21wbGV0ZVBhcmFtcyA9IG9uQ29tcGxldGVBbGxQYXJhbXM7XG4gICAgICB2YXJzLnBhcmVudCA9IHRoaXM7XG4gICAgICBuZXcgVHdlZW4odGFyZ2V0cywgdmFycywgX3BhcnNlUG9zaXRpb24odGhpcywgcG9zaXRpb24pKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnN0YWdnZXJGcm9tID0gZnVuY3Rpb24gc3RhZ2dlckZyb20odGFyZ2V0cywgZHVyYXRpb24sIHZhcnMsIHN0YWdnZXIsIHBvc2l0aW9uLCBvbkNvbXBsZXRlQWxsLCBvbkNvbXBsZXRlQWxsUGFyYW1zKSB7XG4gICAgICB2YXJzLnJ1bkJhY2t3YXJkcyA9IDE7XG4gICAgICBfaW5oZXJpdERlZmF1bHRzKHZhcnMpLmltbWVkaWF0ZVJlbmRlciA9IF9pc05vdEZhbHNlKHZhcnMuaW1tZWRpYXRlUmVuZGVyKTtcbiAgICAgIHJldHVybiB0aGlzLnN0YWdnZXJUbyh0YXJnZXRzLCBkdXJhdGlvbiwgdmFycywgc3RhZ2dlciwgcG9zaXRpb24sIG9uQ29tcGxldGVBbGwsIG9uQ29tcGxldGVBbGxQYXJhbXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnN0YWdnZXJGcm9tVG8gPSBmdW5jdGlvbiBzdGFnZ2VyRnJvbVRvKHRhcmdldHMsIGR1cmF0aW9uLCBmcm9tVmFycywgdG9WYXJzLCBzdGFnZ2VyLCBwb3NpdGlvbiwgb25Db21wbGV0ZUFsbCwgb25Db21wbGV0ZUFsbFBhcmFtcykge1xuICAgICAgdG9WYXJzLnN0YXJ0QXQgPSBmcm9tVmFycztcbiAgICAgIF9pbmhlcml0RGVmYXVsdHModG9WYXJzKS5pbW1lZGlhdGVSZW5kZXIgPSBfaXNOb3RGYWxzZSh0b1ZhcnMuaW1tZWRpYXRlUmVuZGVyKTtcbiAgICAgIHJldHVybiB0aGlzLnN0YWdnZXJUbyh0YXJnZXRzLCBkdXJhdGlvbiwgdG9WYXJzLCBzdGFnZ2VyLCBwb3NpdGlvbiwgb25Db21wbGV0ZUFsbCwgb25Db21wbGV0ZUFsbFBhcmFtcyk7XG4gICAgfTtcblxuICAgIF9wcm90bzIucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKSB7XG4gICAgICB2YXIgcHJldlRpbWUgPSB0aGlzLl90aW1lLFxuICAgICAgICAgIHREdXIgPSB0aGlzLl9kaXJ0eSA/IHRoaXMudG90YWxEdXJhdGlvbigpIDogdGhpcy5fdER1cixcbiAgICAgICAgICBkdXIgPSB0aGlzLl9kdXIsXG4gICAgICAgICAgdFRpbWUgPSB0b3RhbFRpbWUgPD0gMCA/IDAgOiBfcm91bmRQcmVjaXNlKHRvdGFsVGltZSksXG4gICAgICAgICAgY3Jvc3NpbmdTdGFydCA9IHRoaXMuX3pUaW1lIDwgMCAhPT0gdG90YWxUaW1lIDwgMCAmJiAodGhpcy5faW5pdHRlZCB8fCAhZHVyKSxcbiAgICAgICAgICB0aW1lLFxuICAgICAgICAgIGNoaWxkLFxuICAgICAgICAgIG5leHQsXG4gICAgICAgICAgaXRlcmF0aW9uLFxuICAgICAgICAgIGN5Y2xlRHVyYXRpb24sXG4gICAgICAgICAgcHJldlBhdXNlZCxcbiAgICAgICAgICBwYXVzZVR3ZWVuLFxuICAgICAgICAgIHRpbWVTY2FsZSxcbiAgICAgICAgICBwcmV2U3RhcnQsXG4gICAgICAgICAgcHJldkl0ZXJhdGlvbixcbiAgICAgICAgICB5b3lvLFxuICAgICAgICAgIGlzWW95bztcbiAgICAgIHRoaXMgIT09IF9nbG9iYWxUaW1lbGluZSAmJiB0VGltZSA+IHREdXIgJiYgdG90YWxUaW1lID49IDAgJiYgKHRUaW1lID0gdER1cik7XG5cbiAgICAgIGlmICh0VGltZSAhPT0gdGhpcy5fdFRpbWUgfHwgZm9yY2UgfHwgY3Jvc3NpbmdTdGFydCkge1xuICAgICAgICBpZiAocHJldlRpbWUgIT09IHRoaXMuX3RpbWUgJiYgZHVyKSB7XG4gICAgICAgICAgdFRpbWUgKz0gdGhpcy5fdGltZSAtIHByZXZUaW1lO1xuICAgICAgICAgIHRvdGFsVGltZSArPSB0aGlzLl90aW1lIC0gcHJldlRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lID0gdFRpbWU7XG4gICAgICAgIHByZXZTdGFydCA9IHRoaXMuX3N0YXJ0O1xuICAgICAgICB0aW1lU2NhbGUgPSB0aGlzLl90cztcbiAgICAgICAgcHJldlBhdXNlZCA9ICF0aW1lU2NhbGU7XG5cbiAgICAgICAgaWYgKGNyb3NzaW5nU3RhcnQpIHtcbiAgICAgICAgICBkdXIgfHwgKHByZXZUaW1lID0gdGhpcy5felRpbWUpO1xuICAgICAgICAgICh0b3RhbFRpbWUgfHwgIXN1cHByZXNzRXZlbnRzKSAmJiAodGhpcy5felRpbWUgPSB0b3RhbFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlcGVhdCkge1xuICAgICAgICAgIHlveW8gPSB0aGlzLl95b3lvO1xuICAgICAgICAgIGN5Y2xlRHVyYXRpb24gPSBkdXIgKyB0aGlzLl9yRGVsYXk7XG5cbiAgICAgICAgICBpZiAodGhpcy5fcmVwZWF0IDwgLTEgJiYgdG90YWxUaW1lIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG90YWxUaW1lKGN5Y2xlRHVyYXRpb24gKiAxMDAgKyB0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGltZSA9IF9yb3VuZFByZWNpc2UodFRpbWUgJSBjeWNsZUR1cmF0aW9uKTtcblxuICAgICAgICAgIGlmICh0VGltZSA9PT0gdER1cikge1xuICAgICAgICAgICAgaXRlcmF0aW9uID0gdGhpcy5fcmVwZWF0O1xuICAgICAgICAgICAgdGltZSA9IGR1cjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlcmF0aW9uID0gfn4odFRpbWUgLyBjeWNsZUR1cmF0aW9uKTtcblxuICAgICAgICAgICAgaWYgKGl0ZXJhdGlvbiAmJiBpdGVyYXRpb24gPT09IHRUaW1lIC8gY3ljbGVEdXJhdGlvbikge1xuICAgICAgICAgICAgICB0aW1lID0gZHVyO1xuICAgICAgICAgICAgICBpdGVyYXRpb24tLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGltZSA+IGR1ciAmJiAodGltZSA9IGR1cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJldkl0ZXJhdGlvbiA9IF9hbmltYXRpb25DeWNsZSh0aGlzLl90VGltZSwgY3ljbGVEdXJhdGlvbik7XG4gICAgICAgICAgIXByZXZUaW1lICYmIHRoaXMuX3RUaW1lICYmIHByZXZJdGVyYXRpb24gIT09IGl0ZXJhdGlvbiAmJiAocHJldkl0ZXJhdGlvbiA9IGl0ZXJhdGlvbik7XG5cbiAgICAgICAgICBpZiAoeW95byAmJiBpdGVyYXRpb24gJiAxKSB7XG4gICAgICAgICAgICB0aW1lID0gZHVyIC0gdGltZTtcbiAgICAgICAgICAgIGlzWW95byA9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGl0ZXJhdGlvbiAhPT0gcHJldkl0ZXJhdGlvbiAmJiAhdGhpcy5fbG9jaykge1xuICAgICAgICAgICAgdmFyIHJld2luZGluZyA9IHlveW8gJiYgcHJldkl0ZXJhdGlvbiAmIDEsXG4gICAgICAgICAgICAgICAgZG9lc1dyYXAgPSByZXdpbmRpbmcgPT09ICh5b3lvICYmIGl0ZXJhdGlvbiAmIDEpO1xuICAgICAgICAgICAgaXRlcmF0aW9uIDwgcHJldkl0ZXJhdGlvbiAmJiAocmV3aW5kaW5nID0gIXJld2luZGluZyk7XG4gICAgICAgICAgICBwcmV2VGltZSA9IHJld2luZGluZyA/IDAgOiBkdXI7XG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gMTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKHByZXZUaW1lIHx8IChpc1lveW8gPyAwIDogX3JvdW5kUHJlY2lzZShpdGVyYXRpb24gKiBjeWNsZUR1cmF0aW9uKSksIHN1cHByZXNzRXZlbnRzLCAhZHVyKS5fbG9jayA9IDA7XG4gICAgICAgICAgICB0aGlzLl90VGltZSA9IHRUaW1lO1xuICAgICAgICAgICAgIXN1cHByZXNzRXZlbnRzICYmIHRoaXMucGFyZW50ICYmIF9jYWxsYmFjayh0aGlzLCBcIm9uUmVwZWF0XCIpO1xuICAgICAgICAgICAgdGhpcy52YXJzLnJlcGVhdFJlZnJlc2ggJiYgIWlzWW95byAmJiAodGhpcy5pbnZhbGlkYXRlKCkuX2xvY2sgPSAxKTtcblxuICAgICAgICAgICAgaWYgKHByZXZUaW1lICYmIHByZXZUaW1lICE9PSB0aGlzLl90aW1lIHx8IHByZXZQYXVzZWQgIT09ICF0aGlzLl90cyB8fCB0aGlzLnZhcnMub25SZXBlYXQgJiYgIXRoaXMucGFyZW50ICYmICF0aGlzLl9hY3QpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGR1ciA9IHRoaXMuX2R1cjtcbiAgICAgICAgICAgIHREdXIgPSB0aGlzLl90RHVyO1xuXG4gICAgICAgICAgICBpZiAoZG9lc1dyYXApIHtcbiAgICAgICAgICAgICAgdGhpcy5fbG9jayA9IDI7XG4gICAgICAgICAgICAgIHByZXZUaW1lID0gcmV3aW5kaW5nID8gZHVyIDogLTAuMDAwMTtcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXIocHJldlRpbWUsIHRydWUpO1xuICAgICAgICAgICAgICB0aGlzLnZhcnMucmVwZWF0UmVmcmVzaCAmJiAhaXNZb3lvICYmIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gMDtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl90cyAmJiAhcHJldlBhdXNlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3Byb3BhZ2F0ZVlveW9FYXNlKHRoaXMsIGlzWW95byk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2hhc1BhdXNlICYmICF0aGlzLl9mb3JjaW5nICYmIHRoaXMuX2xvY2sgPCAyKSB7XG4gICAgICAgICAgcGF1c2VUd2VlbiA9IF9maW5kTmV4dFBhdXNlVHdlZW4odGhpcywgX3JvdW5kUHJlY2lzZShwcmV2VGltZSksIF9yb3VuZFByZWNpc2UodGltZSkpO1xuXG4gICAgICAgICAgaWYgKHBhdXNlVHdlZW4pIHtcbiAgICAgICAgICAgIHRUaW1lIC09IHRpbWUgLSAodGltZSA9IHBhdXNlVHdlZW4uX3N0YXJ0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90VGltZSA9IHRUaW1lO1xuICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgdGhpcy5fYWN0ID0gIXRpbWVTY2FsZTtcblxuICAgICAgICBpZiAoIXRoaXMuX2luaXR0ZWQpIHtcbiAgICAgICAgICB0aGlzLl9vblVwZGF0ZSA9IHRoaXMudmFycy5vblVwZGF0ZTtcbiAgICAgICAgICB0aGlzLl9pbml0dGVkID0gMTtcbiAgICAgICAgICB0aGlzLl96VGltZSA9IHRvdGFsVGltZTtcbiAgICAgICAgICBwcmV2VGltZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByZXZUaW1lICYmIHRpbWUgJiYgIXN1cHByZXNzRXZlbnRzKSB7XG4gICAgICAgICAgX2NhbGxiYWNrKHRoaXMsIFwib25TdGFydFwiKTtcblxuICAgICAgICAgIGlmICh0aGlzLl90VGltZSAhPT0gdFRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aW1lID49IHByZXZUaW1lICYmIHRvdGFsVGltZSA+PSAwKSB7XG4gICAgICAgICAgY2hpbGQgPSB0aGlzLl9maXJzdDtcblxuICAgICAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICAgICAgbmV4dCA9IGNoaWxkLl9uZXh0O1xuXG4gICAgICAgICAgICBpZiAoKGNoaWxkLl9hY3QgfHwgdGltZSA+PSBjaGlsZC5fc3RhcnQpICYmIGNoaWxkLl90cyAmJiBwYXVzZVR3ZWVuICE9PSBjaGlsZCkge1xuICAgICAgICAgICAgICBpZiAoY2hpbGQucGFyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNoaWxkLnJlbmRlcihjaGlsZC5fdHMgPiAwID8gKHRpbWUgLSBjaGlsZC5fc3RhcnQpICogY2hpbGQuX3RzIDogKGNoaWxkLl9kaXJ0eSA/IGNoaWxkLnRvdGFsRHVyYXRpb24oKSA6IGNoaWxkLl90RHVyKSArICh0aW1lIC0gY2hpbGQuX3N0YXJ0KSAqIGNoaWxkLl90cywgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcblxuICAgICAgICAgICAgICBpZiAodGltZSAhPT0gdGhpcy5fdGltZSB8fCAhdGhpcy5fdHMgJiYgIXByZXZQYXVzZWQpIHtcbiAgICAgICAgICAgICAgICBwYXVzZVR3ZWVuID0gMDtcbiAgICAgICAgICAgICAgICBuZXh0ICYmICh0VGltZSArPSB0aGlzLl96VGltZSA9IC1fdGlueU51bSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hpbGQgPSBuZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGlsZCA9IHRoaXMuX2xhc3Q7XG4gICAgICAgICAgdmFyIGFkanVzdGVkVGltZSA9IHRvdGFsVGltZSA8IDAgPyB0b3RhbFRpbWUgOiB0aW1lO1xuXG4gICAgICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgICAgICBuZXh0ID0gY2hpbGQuX3ByZXY7XG5cbiAgICAgICAgICAgIGlmICgoY2hpbGQuX2FjdCB8fCBhZGp1c3RlZFRpbWUgPD0gY2hpbGQuX2VuZCkgJiYgY2hpbGQuX3RzICYmIHBhdXNlVHdlZW4gIT09IGNoaWxkKSB7XG4gICAgICAgICAgICAgIGlmIChjaGlsZC5wYXJlbnQgIT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXIodG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2hpbGQucmVuZGVyKGNoaWxkLl90cyA+IDAgPyAoYWRqdXN0ZWRUaW1lIC0gY2hpbGQuX3N0YXJ0KSAqIGNoaWxkLl90cyA6IChjaGlsZC5fZGlydHkgPyBjaGlsZC50b3RhbER1cmF0aW9uKCkgOiBjaGlsZC5fdER1cikgKyAoYWRqdXN0ZWRUaW1lIC0gY2hpbGQuX3N0YXJ0KSAqIGNoaWxkLl90cywgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcblxuICAgICAgICAgICAgICBpZiAodGltZSAhPT0gdGhpcy5fdGltZSB8fCAhdGhpcy5fdHMgJiYgIXByZXZQYXVzZWQpIHtcbiAgICAgICAgICAgICAgICBwYXVzZVR3ZWVuID0gMDtcbiAgICAgICAgICAgICAgICBuZXh0ICYmICh0VGltZSArPSB0aGlzLl96VGltZSA9IGFkanVzdGVkVGltZSA/IC1fdGlueU51bSA6IF90aW55TnVtKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGlsZCA9IG5leHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhdXNlVHdlZW4gJiYgIXN1cHByZXNzRXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICAgIHBhdXNlVHdlZW4ucmVuZGVyKHRpbWUgPj0gcHJldlRpbWUgPyAwIDogLV90aW55TnVtKS5felRpbWUgPSB0aW1lID49IHByZXZUaW1lID8gMSA6IC0xO1xuXG4gICAgICAgICAgaWYgKHRoaXMuX3RzKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydCA9IHByZXZTdGFydDtcblxuICAgICAgICAgICAgX3NldEVuZCh0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9vblVwZGF0ZSAmJiAhc3VwcHJlc3NFdmVudHMgJiYgX2NhbGxiYWNrKHRoaXMsIFwib25VcGRhdGVcIiwgdHJ1ZSk7XG4gICAgICAgIGlmICh0VGltZSA9PT0gdER1ciAmJiB0RHVyID49IHRoaXMudG90YWxEdXJhdGlvbigpIHx8ICF0VGltZSAmJiBwcmV2VGltZSkgaWYgKHByZXZTdGFydCA9PT0gdGhpcy5fc3RhcnQgfHwgTWF0aC5hYnModGltZVNjYWxlKSAhPT0gTWF0aC5hYnModGhpcy5fdHMpKSBpZiAoIXRoaXMuX2xvY2spIHtcbiAgICAgICAgICAodG90YWxUaW1lIHx8ICFkdXIpICYmICh0VGltZSA9PT0gdER1ciAmJiB0aGlzLl90cyA+IDAgfHwgIXRUaW1lICYmIHRoaXMuX3RzIDwgMCkgJiYgX3JlbW92ZUZyb21QYXJlbnQodGhpcywgMSk7XG5cbiAgICAgICAgICBpZiAoIXN1cHByZXNzRXZlbnRzICYmICEodG90YWxUaW1lIDwgMCAmJiAhcHJldlRpbWUpICYmICh0VGltZSB8fCBwcmV2VGltZSB8fCAhdER1cikpIHtcbiAgICAgICAgICAgIF9jYWxsYmFjayh0aGlzLCB0VGltZSA9PT0gdER1ciAmJiB0b3RhbFRpbWUgPj0gMCA/IFwib25Db21wbGV0ZVwiIDogXCJvblJldmVyc2VDb21wbGV0ZVwiLCB0cnVlKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJvbSAmJiAhKHRUaW1lIDwgdER1ciAmJiB0aGlzLnRpbWVTY2FsZSgpID4gMCkgJiYgdGhpcy5fcHJvbSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5hZGQgPSBmdW5jdGlvbiBhZGQoY2hpbGQsIHBvc2l0aW9uKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgX2lzTnVtYmVyKHBvc2l0aW9uKSB8fCAocG9zaXRpb24gPSBfcGFyc2VQb3NpdGlvbih0aGlzLCBwb3NpdGlvbiwgY2hpbGQpKTtcblxuICAgICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBBbmltYXRpb24pKSB7XG4gICAgICAgIGlmIChfaXNBcnJheShjaGlsZCkpIHtcbiAgICAgICAgICBjaGlsZC5mb3JFYWNoKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczIuYWRkKG9iaiwgcG9zaXRpb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc1N0cmluZyhjaGlsZCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMYWJlbChjaGlsZCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNoaWxkKSkge1xuICAgICAgICAgIGNoaWxkID0gVHdlZW4uZGVsYXllZENhbGwoMCwgY2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzICE9PSBjaGlsZCA/IF9hZGRUb1RpbWVsaW5lKHRoaXMsIGNoaWxkLCBwb3NpdGlvbikgOiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmdldENoaWxkcmVuID0gZnVuY3Rpb24gZ2V0Q2hpbGRyZW4obmVzdGVkLCB0d2VlbnMsIHRpbWVsaW5lcywgaWdub3JlQmVmb3JlVGltZSkge1xuICAgICAgaWYgKG5lc3RlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIG5lc3RlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0d2VlbnMgPT09IHZvaWQgMCkge1xuICAgICAgICB0d2VlbnMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZWxpbmVzID09PSB2b2lkIDApIHtcbiAgICAgICAgdGltZWxpbmVzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlnbm9yZUJlZm9yZVRpbWUgPT09IHZvaWQgMCkge1xuICAgICAgICBpZ25vcmVCZWZvcmVUaW1lID0gLV9iaWdOdW07XG4gICAgICB9XG5cbiAgICAgIHZhciBhID0gW10sXG4gICAgICAgICAgY2hpbGQgPSB0aGlzLl9maXJzdDtcblxuICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgIGlmIChjaGlsZC5fc3RhcnQgPj0gaWdub3JlQmVmb3JlVGltZSkge1xuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFR3ZWVuKSB7XG4gICAgICAgICAgICB0d2VlbnMgJiYgYS5wdXNoKGNoaWxkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZWxpbmVzICYmIGEucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBuZXN0ZWQgJiYgYS5wdXNoLmFwcGx5KGEsIGNoaWxkLmdldENoaWxkcmVuKHRydWUsIHR3ZWVucywgdGltZWxpbmVzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGE7XG4gICAgfTtcblxuICAgIF9wcm90bzIuZ2V0QnlJZCA9IGZ1bmN0aW9uIGdldEJ5SWQoaWQpIHtcbiAgICAgIHZhciBhbmltYXRpb25zID0gdGhpcy5nZXRDaGlsZHJlbigxLCAxLCAxKSxcbiAgICAgICAgICBpID0gYW5pbWF0aW9ucy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbnNbaV0udmFycy5pZCA9PT0gaWQpIHtcbiAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBfcHJvdG8yLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZShjaGlsZCkge1xuICAgICAgaWYgKF9pc1N0cmluZyhjaGlsZCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlTGFiZWwoY2hpbGQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2lzRnVuY3Rpb24oY2hpbGQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtpbGxUd2VlbnNPZihjaGlsZCk7XG4gICAgICB9XG5cbiAgICAgIF9yZW1vdmVMaW5rZWRMaXN0SXRlbSh0aGlzLCBjaGlsZCk7XG5cbiAgICAgIGlmIChjaGlsZCA9PT0gdGhpcy5fcmVjZW50KSB7XG4gICAgICAgIHRoaXMuX3JlY2VudCA9IHRoaXMuX2xhc3Q7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfdW5jYWNoZSh0aGlzKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi50b3RhbFRpbWUgPSBmdW5jdGlvbiB0b3RhbFRpbWUoX3RvdGFsVGltZTIsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RUaW1lO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9mb3JjaW5nID0gMTtcblxuICAgICAgaWYgKCF0aGlzLl9kcCAmJiB0aGlzLl90cykge1xuICAgICAgICB0aGlzLl9zdGFydCA9IF9yb3VuZFByZWNpc2UoX3RpY2tlci50aW1lIC0gKHRoaXMuX3RzID4gMCA/IF90b3RhbFRpbWUyIC8gdGhpcy5fdHMgOiAodGhpcy50b3RhbER1cmF0aW9uKCkgLSBfdG90YWxUaW1lMikgLyAtdGhpcy5fdHMpKTtcbiAgICAgIH1cblxuICAgICAgX0FuaW1hdGlvbi5wcm90b3R5cGUudG90YWxUaW1lLmNhbGwodGhpcywgX3RvdGFsVGltZTIsIHN1cHByZXNzRXZlbnRzKTtcblxuICAgICAgdGhpcy5fZm9yY2luZyA9IDA7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5hZGRMYWJlbCA9IGZ1bmN0aW9uIGFkZExhYmVsKGxhYmVsLCBwb3NpdGlvbikge1xuICAgICAgdGhpcy5sYWJlbHNbbGFiZWxdID0gX3BhcnNlUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIucmVtb3ZlTGFiZWwgPSBmdW5jdGlvbiByZW1vdmVMYWJlbChsYWJlbCkge1xuICAgICAgZGVsZXRlIHRoaXMubGFiZWxzW2xhYmVsXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmFkZFBhdXNlID0gZnVuY3Rpb24gYWRkUGF1c2UocG9zaXRpb24sIGNhbGxiYWNrLCBwYXJhbXMpIHtcbiAgICAgIHZhciB0ID0gVHdlZW4uZGVsYXllZENhbGwoMCwgY2FsbGJhY2sgfHwgX2VtcHR5RnVuYywgcGFyYW1zKTtcbiAgICAgIHQuZGF0YSA9IFwiaXNQYXVzZVwiO1xuICAgICAgdGhpcy5faGFzUGF1c2UgPSAxO1xuICAgICAgcmV0dXJuIF9hZGRUb1RpbWVsaW5lKHRoaXMsIHQsIF9wYXJzZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKSk7XG4gICAgfTtcblxuICAgIF9wcm90bzIucmVtb3ZlUGF1c2UgPSBmdW5jdGlvbiByZW1vdmVQYXVzZShwb3NpdGlvbikge1xuICAgICAgdmFyIGNoaWxkID0gdGhpcy5fZmlyc3Q7XG4gICAgICBwb3NpdGlvbiA9IF9wYXJzZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcblxuICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgIGlmIChjaGlsZC5fc3RhcnQgPT09IHBvc2l0aW9uICYmIGNoaWxkLmRhdGEgPT09IFwiaXNQYXVzZVwiKSB7XG4gICAgICAgICAgX3JlbW92ZUZyb21QYXJlbnQoY2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3Byb3RvMi5raWxsVHdlZW5zT2YgPSBmdW5jdGlvbiBraWxsVHdlZW5zT2YodGFyZ2V0cywgcHJvcHMsIG9ubHlBY3RpdmUpIHtcbiAgICAgIHZhciB0d2VlbnMgPSB0aGlzLmdldFR3ZWVuc09mKHRhcmdldHMsIG9ubHlBY3RpdmUpLFxuICAgICAgICAgIGkgPSB0d2VlbnMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIF9vdmVyd3JpdGluZ1R3ZWVuICE9PSB0d2VlbnNbaV0gJiYgdHdlZW5zW2ldLmtpbGwodGFyZ2V0cywgcHJvcHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5nZXRUd2VlbnNPZiA9IGZ1bmN0aW9uIGdldFR3ZWVuc09mKHRhcmdldHMsIG9ubHlBY3RpdmUpIHtcbiAgICAgIHZhciBhID0gW10sXG4gICAgICAgICAgcGFyc2VkVGFyZ2V0cyA9IHRvQXJyYXkodGFyZ2V0cyksXG4gICAgICAgICAgY2hpbGQgPSB0aGlzLl9maXJzdCxcbiAgICAgICAgICBpc0dsb2JhbFRpbWUgPSBfaXNOdW1iZXIob25seUFjdGl2ZSksXG4gICAgICAgICAgY2hpbGRyZW47XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUd2Vlbikge1xuICAgICAgICAgIGlmIChfYXJyYXlDb250YWluc0FueShjaGlsZC5fdGFyZ2V0cywgcGFyc2VkVGFyZ2V0cykgJiYgKGlzR2xvYmFsVGltZSA/ICghX292ZXJ3cml0aW5nVHdlZW4gfHwgY2hpbGQuX2luaXR0ZWQgJiYgY2hpbGQuX3RzKSAmJiBjaGlsZC5nbG9iYWxUaW1lKDApIDw9IG9ubHlBY3RpdmUgJiYgY2hpbGQuZ2xvYmFsVGltZShjaGlsZC50b3RhbER1cmF0aW9uKCkpID4gb25seUFjdGl2ZSA6ICFvbmx5QWN0aXZlIHx8IGNoaWxkLmlzQWN0aXZlKCkpKSB7XG4gICAgICAgICAgICBhLnB1c2goY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgoY2hpbGRyZW4gPSBjaGlsZC5nZXRUd2VlbnNPZihwYXJzZWRUYXJnZXRzLCBvbmx5QWN0aXZlKSkubGVuZ3RoKSB7XG4gICAgICAgICAgYS5wdXNoLmFwcGx5KGEsIGNoaWxkcmVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnR3ZWVuVG8gPSBmdW5jdGlvbiB0d2VlblRvKHBvc2l0aW9uLCB2YXJzKSB7XG4gICAgICB2YXJzID0gdmFycyB8fCB7fTtcblxuICAgICAgdmFyIHRsID0gdGhpcyxcbiAgICAgICAgICBlbmRUaW1lID0gX3BhcnNlUG9zaXRpb24odGwsIHBvc2l0aW9uKSxcbiAgICAgICAgICBfdmFycyA9IHZhcnMsXG4gICAgICAgICAgc3RhcnRBdCA9IF92YXJzLnN0YXJ0QXQsXG4gICAgICAgICAgX29uU3RhcnQgPSBfdmFycy5vblN0YXJ0LFxuICAgICAgICAgIG9uU3RhcnRQYXJhbXMgPSBfdmFycy5vblN0YXJ0UGFyYW1zLFxuICAgICAgICAgIGltbWVkaWF0ZVJlbmRlciA9IF92YXJzLmltbWVkaWF0ZVJlbmRlcixcbiAgICAgICAgICBpbml0dGVkLFxuICAgICAgICAgIHR3ZWVuID0gVHdlZW4udG8odGwsIF9zZXREZWZhdWx0cyh7XG4gICAgICAgIGVhc2U6IHZhcnMuZWFzZSB8fCBcIm5vbmVcIixcbiAgICAgICAgbGF6eTogZmFsc2UsXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjogZmFsc2UsXG4gICAgICAgIHRpbWU6IGVuZFRpbWUsXG4gICAgICAgIG92ZXJ3cml0ZTogXCJhdXRvXCIsXG4gICAgICAgIGR1cmF0aW9uOiB2YXJzLmR1cmF0aW9uIHx8IE1hdGguYWJzKChlbmRUaW1lIC0gKHN0YXJ0QXQgJiYgXCJ0aW1lXCIgaW4gc3RhcnRBdCA/IHN0YXJ0QXQudGltZSA6IHRsLl90aW1lKSkgLyB0bC50aW1lU2NhbGUoKSkgfHwgX3RpbnlOdW0sXG4gICAgICAgIG9uU3RhcnQ6IGZ1bmN0aW9uIG9uU3RhcnQoKSB7XG4gICAgICAgICAgdGwucGF1c2UoKTtcblxuICAgICAgICAgIGlmICghaW5pdHRlZCkge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gdmFycy5kdXJhdGlvbiB8fCBNYXRoLmFicygoZW5kVGltZSAtIChzdGFydEF0ICYmIFwidGltZVwiIGluIHN0YXJ0QXQgPyBzdGFydEF0LnRpbWUgOiB0bC5fdGltZSkpIC8gdGwudGltZVNjYWxlKCkpO1xuICAgICAgICAgICAgdHdlZW4uX2R1ciAhPT0gZHVyYXRpb24gJiYgX3NldER1cmF0aW9uKHR3ZWVuLCBkdXJhdGlvbiwgMCwgMSkucmVuZGVyKHR3ZWVuLl90aW1lLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGluaXR0ZWQgPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF9vblN0YXJ0ICYmIF9vblN0YXJ0LmFwcGx5KHR3ZWVuLCBvblN0YXJ0UGFyYW1zIHx8IFtdKTtcbiAgICAgICAgfVxuICAgICAgfSwgdmFycykpO1xuXG4gICAgICByZXR1cm4gaW1tZWRpYXRlUmVuZGVyID8gdHdlZW4ucmVuZGVyKDApIDogdHdlZW47XG4gICAgfTtcblxuICAgIF9wcm90bzIudHdlZW5Gcm9tVG8gPSBmdW5jdGlvbiB0d2VlbkZyb21Ubyhmcm9tUG9zaXRpb24sIHRvUG9zaXRpb24sIHZhcnMpIHtcbiAgICAgIHJldHVybiB0aGlzLnR3ZWVuVG8odG9Qb3NpdGlvbiwgX3NldERlZmF1bHRzKHtcbiAgICAgICAgc3RhcnRBdDoge1xuICAgICAgICAgIHRpbWU6IF9wYXJzZVBvc2l0aW9uKHRoaXMsIGZyb21Qb3NpdGlvbilcbiAgICAgICAgfVxuICAgICAgfSwgdmFycykpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnJlY2VudCA9IGZ1bmN0aW9uIHJlY2VudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZWNlbnQ7XG4gICAgfTtcblxuICAgIF9wcm90bzIubmV4dExhYmVsID0gZnVuY3Rpb24gbmV4dExhYmVsKGFmdGVyVGltZSkge1xuICAgICAgaWYgKGFmdGVyVGltZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGFmdGVyVGltZSA9IHRoaXMuX3RpbWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfZ2V0TGFiZWxJbkRpcmVjdGlvbih0aGlzLCBfcGFyc2VQb3NpdGlvbih0aGlzLCBhZnRlclRpbWUpKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5wcmV2aW91c0xhYmVsID0gZnVuY3Rpb24gcHJldmlvdXNMYWJlbChiZWZvcmVUaW1lKSB7XG4gICAgICBpZiAoYmVmb3JlVGltZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGJlZm9yZVRpbWUgPSB0aGlzLl90aW1lO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX2dldExhYmVsSW5EaXJlY3Rpb24odGhpcywgX3BhcnNlUG9zaXRpb24odGhpcywgYmVmb3JlVGltZSksIDEpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmN1cnJlbnRMYWJlbCA9IGZ1bmN0aW9uIGN1cnJlbnRMYWJlbCh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnNlZWsodmFsdWUsIHRydWUpIDogdGhpcy5wcmV2aW91c0xhYmVsKHRoaXMuX3RpbWUgKyBfdGlueU51bSk7XG4gICAgfTtcblxuICAgIF9wcm90bzIuc2hpZnRDaGlsZHJlbiA9IGZ1bmN0aW9uIHNoaWZ0Q2hpbGRyZW4oYW1vdW50LCBhZGp1c3RMYWJlbHMsIGlnbm9yZUJlZm9yZVRpbWUpIHtcbiAgICAgIGlmIChpZ25vcmVCZWZvcmVUaW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgaWdub3JlQmVmb3JlVGltZSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuX2ZpcnN0LFxuICAgICAgICAgIGxhYmVscyA9IHRoaXMubGFiZWxzLFxuICAgICAgICAgIHA7XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQuX3N0YXJ0ID49IGlnbm9yZUJlZm9yZVRpbWUpIHtcbiAgICAgICAgICBjaGlsZC5fc3RhcnQgKz0gYW1vdW50O1xuICAgICAgICAgIGNoaWxkLl9lbmQgKz0gYW1vdW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgaWYgKGFkanVzdExhYmVscykge1xuICAgICAgICBmb3IgKHAgaW4gbGFiZWxzKSB7XG4gICAgICAgICAgaWYgKGxhYmVsc1twXSA+PSBpZ25vcmVCZWZvcmVUaW1lKSB7XG4gICAgICAgICAgICBsYWJlbHNbcF0gKz0gYW1vdW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3VuY2FjaGUodGhpcyk7XG4gICAgfTtcblxuICAgIF9wcm90bzIuaW52YWxpZGF0ZSA9IGZ1bmN0aW9uIGludmFsaWRhdGUoKSB7XG4gICAgICB2YXIgY2hpbGQgPSB0aGlzLl9maXJzdDtcbiAgICAgIHRoaXMuX2xvY2sgPSAwO1xuXG4gICAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgICAgY2hpbGQuaW52YWxpZGF0ZSgpO1xuICAgICAgICBjaGlsZCA9IGNoaWxkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX0FuaW1hdGlvbi5wcm90b3R5cGUuaW52YWxpZGF0ZS5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoaW5jbHVkZUxhYmVscykge1xuICAgICAgaWYgKGluY2x1ZGVMYWJlbHMgPT09IHZvaWQgMCkge1xuICAgICAgICBpbmNsdWRlTGFiZWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNoaWxkID0gdGhpcy5fZmlyc3QsXG4gICAgICAgICAgbmV4dDtcblxuICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgIG5leHQgPSBjaGlsZC5fbmV4dDtcbiAgICAgICAgdGhpcy5yZW1vdmUoY2hpbGQpO1xuICAgICAgICBjaGlsZCA9IG5leHQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2RwICYmICh0aGlzLl90aW1lID0gdGhpcy5fdFRpbWUgPSB0aGlzLl9wVGltZSA9IDApO1xuICAgICAgaW5jbHVkZUxhYmVscyAmJiAodGhpcy5sYWJlbHMgPSB7fSk7XG4gICAgICByZXR1cm4gX3VuY2FjaGUodGhpcyk7XG4gICAgfTtcblxuICAgIF9wcm90bzIudG90YWxEdXJhdGlvbiA9IGZ1bmN0aW9uIHRvdGFsRHVyYXRpb24odmFsdWUpIHtcbiAgICAgIHZhciBtYXggPSAwLFxuICAgICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGNoaWxkID0gc2VsZi5fbGFzdCxcbiAgICAgICAgICBwcmV2U3RhcnQgPSBfYmlnTnVtLFxuICAgICAgICAgIHByZXYsXG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgcGFyZW50O1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc2VsZi50aW1lU2NhbGUoKHNlbGYuX3JlcGVhdCA8IDAgPyBzZWxmLmR1cmF0aW9uKCkgOiBzZWxmLnRvdGFsRHVyYXRpb24oKSkgLyAoc2VsZi5yZXZlcnNlZCgpID8gLXZhbHVlIDogdmFsdWUpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuX2RpcnR5KSB7XG4gICAgICAgIHBhcmVudCA9IHNlbGYucGFyZW50O1xuXG4gICAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICAgIHByZXYgPSBjaGlsZC5fcHJldjtcbiAgICAgICAgICBjaGlsZC5fZGlydHkgJiYgY2hpbGQudG90YWxEdXJhdGlvbigpO1xuICAgICAgICAgIHN0YXJ0ID0gY2hpbGQuX3N0YXJ0O1xuXG4gICAgICAgICAgaWYgKHN0YXJ0ID4gcHJldlN0YXJ0ICYmIHNlbGYuX3NvcnQgJiYgY2hpbGQuX3RzICYmICFzZWxmLl9sb2NrKSB7XG4gICAgICAgICAgICBzZWxmLl9sb2NrID0gMTtcbiAgICAgICAgICAgIF9hZGRUb1RpbWVsaW5lKHNlbGYsIGNoaWxkLCBzdGFydCAtIGNoaWxkLl9kZWxheSwgMSkuX2xvY2sgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2U3RhcnQgPSBzdGFydDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3RhcnQgPCAwICYmIGNoaWxkLl90cykge1xuICAgICAgICAgICAgbWF4IC09IHN0YXJ0O1xuXG4gICAgICAgICAgICBpZiAoIXBhcmVudCAmJiAhc2VsZi5fZHAgfHwgcGFyZW50ICYmIHBhcmVudC5zbW9vdGhDaGlsZFRpbWluZykge1xuICAgICAgICAgICAgICBzZWxmLl9zdGFydCArPSBzdGFydCAvIHNlbGYuX3RzO1xuICAgICAgICAgICAgICBzZWxmLl90aW1lIC09IHN0YXJ0O1xuICAgICAgICAgICAgICBzZWxmLl90VGltZSAtPSBzdGFydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5zaGlmdENoaWxkcmVuKC1zdGFydCwgZmFsc2UsIC0xZTk5OSk7XG4gICAgICAgICAgICBwcmV2U3RhcnQgPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNoaWxkLl9lbmQgPiBtYXggJiYgY2hpbGQuX3RzICYmIChtYXggPSBjaGlsZC5fZW5kKTtcbiAgICAgICAgICBjaGlsZCA9IHByZXY7XG4gICAgICAgIH1cblxuICAgICAgICBfc2V0RHVyYXRpb24oc2VsZiwgc2VsZiA9PT0gX2dsb2JhbFRpbWVsaW5lICYmIHNlbGYuX3RpbWUgPiBtYXggPyBzZWxmLl90aW1lIDogbWF4LCAxLCAxKTtcblxuICAgICAgICBzZWxmLl9kaXJ0eSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLl90RHVyO1xuICAgIH07XG5cbiAgICBUaW1lbGluZS51cGRhdGVSb290ID0gZnVuY3Rpb24gdXBkYXRlUm9vdCh0aW1lKSB7XG4gICAgICBpZiAoX2dsb2JhbFRpbWVsaW5lLl90cykge1xuICAgICAgICBfbGF6eVNhZmVSZW5kZXIoX2dsb2JhbFRpbWVsaW5lLCBfcGFyZW50VG9DaGlsZFRvdGFsVGltZSh0aW1lLCBfZ2xvYmFsVGltZWxpbmUpKTtcblxuICAgICAgICBfbGFzdFJlbmRlcmVkRnJhbWUgPSBfdGlja2VyLmZyYW1lO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RpY2tlci5mcmFtZSA+PSBfbmV4dEdDRnJhbWUpIHtcbiAgICAgICAgX25leHRHQ0ZyYW1lICs9IF9jb25maWcuYXV0b1NsZWVwIHx8IDEyMDtcbiAgICAgICAgdmFyIGNoaWxkID0gX2dsb2JhbFRpbWVsaW5lLl9maXJzdDtcbiAgICAgICAgaWYgKCFjaGlsZCB8fCAhY2hpbGQuX3RzKSBpZiAoX2NvbmZpZy5hdXRvU2xlZXAgJiYgX3RpY2tlci5fbGlzdGVuZXJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICB3aGlsZSAoY2hpbGQgJiYgIWNoaWxkLl90cykge1xuICAgICAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaGlsZCB8fCBfdGlja2VyLnNsZWVwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFRpbWVsaW5lO1xuICB9KEFuaW1hdGlvbik7XG5cbiAgX3NldERlZmF1bHRzKFRpbWVsaW5lLnByb3RvdHlwZSwge1xuICAgIF9sb2NrOiAwLFxuICAgIF9oYXNQYXVzZTogMCxcbiAgICBfZm9yY2luZzogMFxuICB9KTtcblxuICB2YXIgX2FkZENvbXBsZXhTdHJpbmdQcm9wVHdlZW4gPSBmdW5jdGlvbiBfYWRkQ29tcGxleFN0cmluZ1Byb3BUd2Vlbih0YXJnZXQsIHByb3AsIHN0YXJ0LCBlbmQsIHNldHRlciwgc3RyaW5nRmlsdGVyLCBmdW5jUGFyYW0pIHtcbiAgICB2YXIgcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCB0YXJnZXQsIHByb3AsIDAsIDEsIF9yZW5kZXJDb21wbGV4U3RyaW5nLCBudWxsLCBzZXR0ZXIpLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIG1hdGNoSW5kZXggPSAwLFxuICAgICAgICByZXN1bHQsXG4gICAgICAgIHN0YXJ0TnVtcyxcbiAgICAgICAgY29sb3IsXG4gICAgICAgIGVuZE51bSxcbiAgICAgICAgY2h1bmssXG4gICAgICAgIHN0YXJ0TnVtLFxuICAgICAgICBoYXNSYW5kb20sXG4gICAgICAgIGE7XG4gICAgcHQuYiA9IHN0YXJ0O1xuICAgIHB0LmUgPSBlbmQ7XG4gICAgc3RhcnQgKz0gXCJcIjtcbiAgICBlbmQgKz0gXCJcIjtcblxuICAgIGlmIChoYXNSYW5kb20gPSB+ZW5kLmluZGV4T2YoXCJyYW5kb20oXCIpKSB7XG4gICAgICBlbmQgPSBfcmVwbGFjZVJhbmRvbShlbmQpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmdGaWx0ZXIpIHtcbiAgICAgIGEgPSBbc3RhcnQsIGVuZF07XG4gICAgICBzdHJpbmdGaWx0ZXIoYSwgdGFyZ2V0LCBwcm9wKTtcbiAgICAgIHN0YXJ0ID0gYVswXTtcbiAgICAgIGVuZCA9IGFbMV07XG4gICAgfVxuXG4gICAgc3RhcnROdW1zID0gc3RhcnQubWF0Y2goX2NvbXBsZXhTdHJpbmdOdW1FeHApIHx8IFtdO1xuXG4gICAgd2hpbGUgKHJlc3VsdCA9IF9jb21wbGV4U3RyaW5nTnVtRXhwLmV4ZWMoZW5kKSkge1xuICAgICAgZW5kTnVtID0gcmVzdWx0WzBdO1xuICAgICAgY2h1bmsgPSBlbmQuc3Vic3RyaW5nKGluZGV4LCByZXN1bHQuaW5kZXgpO1xuXG4gICAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgY29sb3IgPSAoY29sb3IgKyAxKSAlIDU7XG4gICAgICB9IGVsc2UgaWYgKGNodW5rLnN1YnN0cigtNSkgPT09IFwicmdiYShcIikge1xuICAgICAgICBjb2xvciA9IDE7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmROdW0gIT09IHN0YXJ0TnVtc1ttYXRjaEluZGV4KytdKSB7XG4gICAgICAgIHN0YXJ0TnVtID0gcGFyc2VGbG9hdChzdGFydE51bXNbbWF0Y2hJbmRleCAtIDFdKSB8fCAwO1xuICAgICAgICBwdC5fcHQgPSB7XG4gICAgICAgICAgX25leHQ6IHB0Ll9wdCxcbiAgICAgICAgICBwOiBjaHVuayB8fCBtYXRjaEluZGV4ID09PSAxID8gY2h1bmsgOiBcIixcIixcbiAgICAgICAgICBzOiBzdGFydE51bSxcbiAgICAgICAgICBjOiBlbmROdW0uY2hhckF0KDEpID09PSBcIj1cIiA/IHBhcnNlRmxvYXQoZW5kTnVtLnN1YnN0cigyKSkgKiAoZW5kTnVtLmNoYXJBdCgwKSA9PT0gXCItXCIgPyAtMSA6IDEpIDogcGFyc2VGbG9hdChlbmROdW0pIC0gc3RhcnROdW0sXG4gICAgICAgICAgbTogY29sb3IgJiYgY29sb3IgPCA0ID8gTWF0aC5yb3VuZCA6IDBcbiAgICAgICAgfTtcbiAgICAgICAgaW5kZXggPSBfY29tcGxleFN0cmluZ051bUV4cC5sYXN0SW5kZXg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHQuYyA9IGluZGV4IDwgZW5kLmxlbmd0aCA/IGVuZC5zdWJzdHJpbmcoaW5kZXgsIGVuZC5sZW5ndGgpIDogXCJcIjtcbiAgICBwdC5mcCA9IGZ1bmNQYXJhbTtcblxuICAgIGlmIChfcmVsRXhwLnRlc3QoZW5kKSB8fCBoYXNSYW5kb20pIHtcbiAgICAgIHB0LmUgPSAwO1xuICAgIH1cblxuICAgIHRoaXMuX3B0ID0gcHQ7XG4gICAgcmV0dXJuIHB0O1xuICB9LFxuICAgICAgX2FkZFByb3BUd2VlbiA9IGZ1bmN0aW9uIF9hZGRQcm9wVHdlZW4odGFyZ2V0LCBwcm9wLCBzdGFydCwgZW5kLCBpbmRleCwgdGFyZ2V0cywgbW9kaWZpZXIsIHN0cmluZ0ZpbHRlciwgZnVuY1BhcmFtKSB7XG4gICAgX2lzRnVuY3Rpb24oZW5kKSAmJiAoZW5kID0gZW5kKGluZGV4IHx8IDAsIHRhcmdldCwgdGFyZ2V0cykpO1xuICAgIHZhciBjdXJyZW50VmFsdWUgPSB0YXJnZXRbcHJvcF0sXG4gICAgICAgIHBhcnNlZFN0YXJ0ID0gc3RhcnQgIT09IFwiZ2V0XCIgPyBzdGFydCA6ICFfaXNGdW5jdGlvbihjdXJyZW50VmFsdWUpID8gY3VycmVudFZhbHVlIDogZnVuY1BhcmFtID8gdGFyZ2V0W3Byb3AuaW5kZXhPZihcInNldFwiKSB8fCAhX2lzRnVuY3Rpb24odGFyZ2V0W1wiZ2V0XCIgKyBwcm9wLnN1YnN0cigzKV0pID8gcHJvcCA6IFwiZ2V0XCIgKyBwcm9wLnN1YnN0cigzKV0oZnVuY1BhcmFtKSA6IHRhcmdldFtwcm9wXSgpLFxuICAgICAgICBzZXR0ZXIgPSAhX2lzRnVuY3Rpb24oY3VycmVudFZhbHVlKSA/IF9zZXR0ZXJQbGFpbiA6IGZ1bmNQYXJhbSA/IF9zZXR0ZXJGdW5jV2l0aFBhcmFtIDogX3NldHRlckZ1bmMsXG4gICAgICAgIHB0O1xuXG4gICAgaWYgKF9pc1N0cmluZyhlbmQpKSB7XG4gICAgICBpZiAofmVuZC5pbmRleE9mKFwicmFuZG9tKFwiKSkge1xuICAgICAgICBlbmQgPSBfcmVwbGFjZVJhbmRvbShlbmQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5kLmNoYXJBdCgxKSA9PT0gXCI9XCIpIHtcbiAgICAgICAgcHQgPSBwYXJzZUZsb2F0KHBhcnNlZFN0YXJ0KSArIHBhcnNlRmxvYXQoZW5kLnN1YnN0cigyKSkgKiAoZW5kLmNoYXJBdCgwKSA9PT0gXCItXCIgPyAtMSA6IDEpICsgKGdldFVuaXQocGFyc2VkU3RhcnQpIHx8IDApO1xuXG4gICAgICAgIGlmIChwdCB8fCBwdCA9PT0gMCkge1xuICAgICAgICAgIGVuZCA9IHB0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlZFN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgIGlmICghaXNOYU4ocGFyc2VkU3RhcnQgKiBlbmQpICYmIGVuZCAhPT0gXCJcIikge1xuICAgICAgICBwdCA9IG5ldyBQcm9wVHdlZW4odGhpcy5fcHQsIHRhcmdldCwgcHJvcCwgK3BhcnNlZFN0YXJ0IHx8IDAsIGVuZCAtIChwYXJzZWRTdGFydCB8fCAwKSwgdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gXCJib29sZWFuXCIgPyBfcmVuZGVyQm9vbGVhbiA6IF9yZW5kZXJQbGFpbiwgMCwgc2V0dGVyKTtcbiAgICAgICAgZnVuY1BhcmFtICYmIChwdC5mcCA9IGZ1bmNQYXJhbSk7XG4gICAgICAgIG1vZGlmaWVyICYmIHB0Lm1vZGlmaWVyKG1vZGlmaWVyLCB0aGlzLCB0YXJnZXQpO1xuICAgICAgICByZXR1cm4gdGhpcy5fcHQgPSBwdDtcbiAgICAgIH1cblxuICAgICAgIWN1cnJlbnRWYWx1ZSAmJiAhKHByb3AgaW4gdGFyZ2V0KSAmJiBfbWlzc2luZ1BsdWdpbihwcm9wLCBlbmQpO1xuICAgICAgcmV0dXJuIF9hZGRDb21wbGV4U3RyaW5nUHJvcFR3ZWVuLmNhbGwodGhpcywgdGFyZ2V0LCBwcm9wLCBwYXJzZWRTdGFydCwgZW5kLCBzZXR0ZXIsIHN0cmluZ0ZpbHRlciB8fCBfY29uZmlnLnN0cmluZ0ZpbHRlciwgZnVuY1BhcmFtKTtcbiAgICB9XG4gIH0sXG4gICAgICBfcHJvY2Vzc1ZhcnMgPSBmdW5jdGlvbiBfcHJvY2Vzc1ZhcnModmFycywgaW5kZXgsIHRhcmdldCwgdGFyZ2V0cywgdHdlZW4pIHtcbiAgICBfaXNGdW5jdGlvbih2YXJzKSAmJiAodmFycyA9IF9wYXJzZUZ1bmNPclN0cmluZyh2YXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldCwgdGFyZ2V0cykpO1xuXG4gICAgaWYgKCFfaXNPYmplY3QodmFycykgfHwgdmFycy5zdHlsZSAmJiB2YXJzLm5vZGVUeXBlIHx8IF9pc0FycmF5KHZhcnMpIHx8IF9pc1R5cGVkQXJyYXkodmFycykpIHtcbiAgICAgIHJldHVybiBfaXNTdHJpbmcodmFycykgPyBfcGFyc2VGdW5jT3JTdHJpbmcodmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpIDogdmFycztcbiAgICB9XG5cbiAgICB2YXIgY29weSA9IHt9LFxuICAgICAgICBwO1xuXG4gICAgZm9yIChwIGluIHZhcnMpIHtcbiAgICAgIGNvcHlbcF0gPSBfcGFyc2VGdW5jT3JTdHJpbmcodmFyc1twXSwgdHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpO1xuICAgIH1cblxuICAgIHJldHVybiBjb3B5O1xuICB9LFxuICAgICAgX2NoZWNrUGx1Z2luID0gZnVuY3Rpb24gX2NoZWNrUGx1Z2luKHByb3BlcnR5LCB2YXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldCwgdGFyZ2V0cykge1xuICAgIHZhciBwbHVnaW4sIHB0LCBwdExvb2t1cCwgaTtcblxuICAgIGlmIChfcGx1Z2luc1twcm9wZXJ0eV0gJiYgKHBsdWdpbiA9IG5ldyBfcGx1Z2luc1twcm9wZXJ0eV0oKSkuaW5pdCh0YXJnZXQsIHBsdWdpbi5yYXdWYXJzID8gdmFyc1twcm9wZXJ0eV0gOiBfcHJvY2Vzc1ZhcnModmFyc1twcm9wZXJ0eV0sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMsIHR3ZWVuKSwgdHdlZW4sIGluZGV4LCB0YXJnZXRzKSAhPT0gZmFsc2UpIHtcbiAgICAgIHR3ZWVuLl9wdCA9IHB0ID0gbmV3IFByb3BUd2Vlbih0d2Vlbi5fcHQsIHRhcmdldCwgcHJvcGVydHksIDAsIDEsIHBsdWdpbi5yZW5kZXIsIHBsdWdpbiwgMCwgcGx1Z2luLnByaW9yaXR5KTtcblxuICAgICAgaWYgKHR3ZWVuICE9PSBfcXVpY2tUd2Vlbikge1xuICAgICAgICBwdExvb2t1cCA9IHR3ZWVuLl9wdExvb2t1cFt0d2Vlbi5fdGFyZ2V0cy5pbmRleE9mKHRhcmdldCldO1xuICAgICAgICBpID0gcGx1Z2luLl9wcm9wcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIHB0TG9va3VwW3BsdWdpbi5fcHJvcHNbaV1dID0gcHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGx1Z2luO1xuICB9LFxuICAgICAgX292ZXJ3cml0aW5nVHdlZW4sXG4gICAgICBfaW5pdFR3ZWVuID0gZnVuY3Rpb24gX2luaXRUd2Vlbih0d2VlbiwgdGltZSkge1xuICAgIHZhciB2YXJzID0gdHdlZW4udmFycyxcbiAgICAgICAgZWFzZSA9IHZhcnMuZWFzZSxcbiAgICAgICAgc3RhcnRBdCA9IHZhcnMuc3RhcnRBdCxcbiAgICAgICAgaW1tZWRpYXRlUmVuZGVyID0gdmFycy5pbW1lZGlhdGVSZW5kZXIsXG4gICAgICAgIGxhenkgPSB2YXJzLmxhenksXG4gICAgICAgIG9uVXBkYXRlID0gdmFycy5vblVwZGF0ZSxcbiAgICAgICAgb25VcGRhdGVQYXJhbXMgPSB2YXJzLm9uVXBkYXRlUGFyYW1zLFxuICAgICAgICBjYWxsYmFja1Njb3BlID0gdmFycy5jYWxsYmFja1Njb3BlLFxuICAgICAgICBydW5CYWNrd2FyZHMgPSB2YXJzLnJ1bkJhY2t3YXJkcyxcbiAgICAgICAgeW95b0Vhc2UgPSB2YXJzLnlveW9FYXNlLFxuICAgICAgICBrZXlmcmFtZXMgPSB2YXJzLmtleWZyYW1lcyxcbiAgICAgICAgYXV0b1JldmVydCA9IHZhcnMuYXV0b1JldmVydCxcbiAgICAgICAgZHVyID0gdHdlZW4uX2R1cixcbiAgICAgICAgcHJldlN0YXJ0QXQgPSB0d2Vlbi5fc3RhcnRBdCxcbiAgICAgICAgdGFyZ2V0cyA9IHR3ZWVuLl90YXJnZXRzLFxuICAgICAgICBwYXJlbnQgPSB0d2Vlbi5wYXJlbnQsXG4gICAgICAgIGZ1bGxUYXJnZXRzID0gcGFyZW50ICYmIHBhcmVudC5kYXRhID09PSBcIm5lc3RlZFwiID8gcGFyZW50LnBhcmVudC5fdGFyZ2V0cyA6IHRhcmdldHMsXG4gICAgICAgIGF1dG9PdmVyd3JpdGUgPSB0d2Vlbi5fb3ZlcndyaXRlID09PSBcImF1dG9cIiAmJiAhX3N1cHByZXNzT3ZlcndyaXRlcyxcbiAgICAgICAgdGwgPSB0d2Vlbi50aW1lbGluZSxcbiAgICAgICAgY2xlYW5WYXJzLFxuICAgICAgICBpLFxuICAgICAgICBwLFxuICAgICAgICBwdCxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBoYXNQcmlvcml0eSxcbiAgICAgICAgZ3NEYXRhLFxuICAgICAgICBoYXJuZXNzLFxuICAgICAgICBwbHVnaW4sXG4gICAgICAgIHB0TG9va3VwLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgaGFybmVzc1ZhcnMsXG4gICAgICAgIG92ZXJ3cml0dGVuO1xuICAgIHRsICYmICgha2V5ZnJhbWVzIHx8ICFlYXNlKSAmJiAoZWFzZSA9IFwibm9uZVwiKTtcbiAgICB0d2Vlbi5fZWFzZSA9IF9wYXJzZUVhc2UoZWFzZSwgX2RlZmF1bHRzLmVhc2UpO1xuICAgIHR3ZWVuLl95RWFzZSA9IHlveW9FYXNlID8gX2ludmVydEVhc2UoX3BhcnNlRWFzZSh5b3lvRWFzZSA9PT0gdHJ1ZSA/IGVhc2UgOiB5b3lvRWFzZSwgX2RlZmF1bHRzLmVhc2UpKSA6IDA7XG5cbiAgICBpZiAoeW95b0Vhc2UgJiYgdHdlZW4uX3lveW8gJiYgIXR3ZWVuLl9yZXBlYXQpIHtcbiAgICAgIHlveW9FYXNlID0gdHdlZW4uX3lFYXNlO1xuICAgICAgdHdlZW4uX3lFYXNlID0gdHdlZW4uX2Vhc2U7XG4gICAgICB0d2Vlbi5fZWFzZSA9IHlveW9FYXNlO1xuICAgIH1cblxuICAgIHR3ZWVuLl9mcm9tID0gIXRsICYmICEhdmFycy5ydW5CYWNrd2FyZHM7XG5cbiAgICBpZiAoIXRsIHx8IGtleWZyYW1lcyAmJiAhdmFycy5zdGFnZ2VyKSB7XG4gICAgICBoYXJuZXNzID0gdGFyZ2V0c1swXSA/IF9nZXRDYWNoZSh0YXJnZXRzWzBdKS5oYXJuZXNzIDogMDtcbiAgICAgIGhhcm5lc3NWYXJzID0gaGFybmVzcyAmJiB2YXJzW2hhcm5lc3MucHJvcF07XG4gICAgICBjbGVhblZhcnMgPSBfY29weUV4Y2x1ZGluZyh2YXJzLCBfcmVzZXJ2ZWRQcm9wcyk7XG4gICAgICBwcmV2U3RhcnRBdCAmJiBfcmVtb3ZlRnJvbVBhcmVudChwcmV2U3RhcnRBdC5yZW5kZXIoLTEsIHRydWUpKTtcblxuICAgICAgaWYgKHN0YXJ0QXQpIHtcbiAgICAgICAgX3JlbW92ZUZyb21QYXJlbnQodHdlZW4uX3N0YXJ0QXQgPSBUd2Vlbi5zZXQodGFyZ2V0cywgX3NldERlZmF1bHRzKHtcbiAgICAgICAgICBkYXRhOiBcImlzU3RhcnRcIixcbiAgICAgICAgICBvdmVyd3JpdGU6IGZhbHNlLFxuICAgICAgICAgIHBhcmVudDogcGFyZW50LFxuICAgICAgICAgIGltbWVkaWF0ZVJlbmRlcjogdHJ1ZSxcbiAgICAgICAgICBsYXp5OiBfaXNOb3RGYWxzZShsYXp5KSxcbiAgICAgICAgICBzdGFydEF0OiBudWxsLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIG9uVXBkYXRlOiBvblVwZGF0ZSxcbiAgICAgICAgICBvblVwZGF0ZVBhcmFtczogb25VcGRhdGVQYXJhbXMsXG4gICAgICAgICAgY2FsbGJhY2tTY29wZTogY2FsbGJhY2tTY29wZSxcbiAgICAgICAgICBzdGFnZ2VyOiAwXG4gICAgICAgIH0sIHN0YXJ0QXQpKSk7XG5cbiAgICAgICAgdGltZSA8IDAgJiYgIWltbWVkaWF0ZVJlbmRlciAmJiAhYXV0b1JldmVydCAmJiB0d2Vlbi5fc3RhcnRBdC5yZW5kZXIoLTEsIHRydWUpO1xuXG4gICAgICAgIGlmIChpbW1lZGlhdGVSZW5kZXIpIHtcbiAgICAgICAgICB0aW1lID4gMCAmJiAhYXV0b1JldmVydCAmJiAodHdlZW4uX3N0YXJ0QXQgPSAwKTtcblxuICAgICAgICAgIGlmIChkdXIgJiYgdGltZSA8PSAwKSB7XG4gICAgICAgICAgICB0aW1lICYmICh0d2Vlbi5felRpbWUgPSB0aW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYXV0b1JldmVydCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB0d2Vlbi5fc3RhcnRBdCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocnVuQmFja3dhcmRzICYmIGR1cikge1xuICAgICAgICBpZiAocHJldlN0YXJ0QXQpIHtcbiAgICAgICAgICAhYXV0b1JldmVydCAmJiAodHdlZW4uX3N0YXJ0QXQgPSAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lICYmIChpbW1lZGlhdGVSZW5kZXIgPSBmYWxzZSk7XG4gICAgICAgICAgcCA9IF9zZXREZWZhdWx0cyh7XG4gICAgICAgICAgICBvdmVyd3JpdGU6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogXCJpc0Zyb21TdGFydFwiLFxuICAgICAgICAgICAgbGF6eTogaW1tZWRpYXRlUmVuZGVyICYmIF9pc05vdEZhbHNlKGxhenkpLFxuICAgICAgICAgICAgaW1tZWRpYXRlUmVuZGVyOiBpbW1lZGlhdGVSZW5kZXIsXG4gICAgICAgICAgICBzdGFnZ2VyOiAwLFxuICAgICAgICAgICAgcGFyZW50OiBwYXJlbnRcbiAgICAgICAgICB9LCBjbGVhblZhcnMpO1xuICAgICAgICAgIGhhcm5lc3NWYXJzICYmIChwW2hhcm5lc3MucHJvcF0gPSBoYXJuZXNzVmFycyk7XG5cbiAgICAgICAgICBfcmVtb3ZlRnJvbVBhcmVudCh0d2Vlbi5fc3RhcnRBdCA9IFR3ZWVuLnNldCh0YXJnZXRzLCBwKSk7XG5cbiAgICAgICAgICB0aW1lIDwgMCAmJiB0d2Vlbi5fc3RhcnRBdC5yZW5kZXIoLTEsIHRydWUpO1xuICAgICAgICAgIHR3ZWVuLl96VGltZSA9IHRpbWU7XG5cbiAgICAgICAgICBpZiAoIWltbWVkaWF0ZVJlbmRlcikge1xuICAgICAgICAgICAgX2luaXRUd2Vlbih0d2Vlbi5fc3RhcnRBdCwgX3RpbnlOdW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHdlZW4uX3B0ID0gMDtcbiAgICAgIGxhenkgPSBkdXIgJiYgX2lzTm90RmFsc2UobGF6eSkgfHwgbGF6eSAmJiAhZHVyO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICBnc0RhdGEgPSB0YXJnZXQuX2dzYXAgfHwgX2hhcm5lc3ModGFyZ2V0cylbaV0uX2dzYXA7XG4gICAgICAgIHR3ZWVuLl9wdExvb2t1cFtpXSA9IHB0TG9va3VwID0ge307XG4gICAgICAgIF9sYXp5TG9va3VwW2dzRGF0YS5pZF0gJiYgX2xhenlUd2VlbnMubGVuZ3RoICYmIF9sYXp5UmVuZGVyKCk7XG4gICAgICAgIGluZGV4ID0gZnVsbFRhcmdldHMgPT09IHRhcmdldHMgPyBpIDogZnVsbFRhcmdldHMuaW5kZXhPZih0YXJnZXQpO1xuXG4gICAgICAgIGlmIChoYXJuZXNzICYmIChwbHVnaW4gPSBuZXcgaGFybmVzcygpKS5pbml0KHRhcmdldCwgaGFybmVzc1ZhcnMgfHwgY2xlYW5WYXJzLCB0d2VlbiwgaW5kZXgsIGZ1bGxUYXJnZXRzKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICB0d2Vlbi5fcHQgPSBwdCA9IG5ldyBQcm9wVHdlZW4odHdlZW4uX3B0LCB0YXJnZXQsIHBsdWdpbi5uYW1lLCAwLCAxLCBwbHVnaW4ucmVuZGVyLCBwbHVnaW4sIDAsIHBsdWdpbi5wcmlvcml0eSk7XG5cbiAgICAgICAgICBwbHVnaW4uX3Byb3BzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHB0TG9va3VwW25hbWVdID0gcHQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBwbHVnaW4ucHJpb3JpdHkgJiYgKGhhc1ByaW9yaXR5ID0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhcm5lc3MgfHwgaGFybmVzc1ZhcnMpIHtcbiAgICAgICAgICBmb3IgKHAgaW4gY2xlYW5WYXJzKSB7XG4gICAgICAgICAgICBpZiAoX3BsdWdpbnNbcF0gJiYgKHBsdWdpbiA9IF9jaGVja1BsdWdpbihwLCBjbGVhblZhcnMsIHR3ZWVuLCBpbmRleCwgdGFyZ2V0LCBmdWxsVGFyZ2V0cykpKSB7XG4gICAgICAgICAgICAgIHBsdWdpbi5wcmlvcml0eSAmJiAoaGFzUHJpb3JpdHkgPSAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHB0TG9va3VwW3BdID0gcHQgPSBfYWRkUHJvcFR3ZWVuLmNhbGwodHdlZW4sIHRhcmdldCwgcCwgXCJnZXRcIiwgY2xlYW5WYXJzW3BdLCBpbmRleCwgZnVsbFRhcmdldHMsIDAsIHZhcnMuc3RyaW5nRmlsdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0d2Vlbi5fb3AgJiYgdHdlZW4uX29wW2ldICYmIHR3ZWVuLmtpbGwodGFyZ2V0LCB0d2Vlbi5fb3BbaV0pO1xuXG4gICAgICAgIGlmIChhdXRvT3ZlcndyaXRlICYmIHR3ZWVuLl9wdCkge1xuICAgICAgICAgIF9vdmVyd3JpdGluZ1R3ZWVuID0gdHdlZW47XG5cbiAgICAgICAgICBfZ2xvYmFsVGltZWxpbmUua2lsbFR3ZWVuc09mKHRhcmdldCwgcHRMb29rdXAsIHR3ZWVuLmdsb2JhbFRpbWUodGltZSkpO1xuXG4gICAgICAgICAgb3ZlcndyaXR0ZW4gPSAhdHdlZW4ucGFyZW50O1xuICAgICAgICAgIF9vdmVyd3JpdGluZ1R3ZWVuID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHR3ZWVuLl9wdCAmJiBsYXp5ICYmIChfbGF6eUxvb2t1cFtnc0RhdGEuaWRdID0gMSk7XG4gICAgICB9XG5cbiAgICAgIGhhc1ByaW9yaXR5ICYmIF9zb3J0UHJvcFR3ZWVuc0J5UHJpb3JpdHkodHdlZW4pO1xuICAgICAgdHdlZW4uX29uSW5pdCAmJiB0d2Vlbi5fb25Jbml0KHR3ZWVuKTtcbiAgICB9XG5cbiAgICB0d2Vlbi5fb25VcGRhdGUgPSBvblVwZGF0ZTtcbiAgICB0d2Vlbi5faW5pdHRlZCA9ICghdHdlZW4uX29wIHx8IHR3ZWVuLl9wdCkgJiYgIW92ZXJ3cml0dGVuO1xuICAgIGtleWZyYW1lcyAmJiB0aW1lIDw9IDAgJiYgdGwucmVuZGVyKF9iaWdOdW0sIHRydWUsIHRydWUpO1xuICB9LFxuICAgICAgX2FkZEFsaWFzZXNUb1ZhcnMgPSBmdW5jdGlvbiBfYWRkQWxpYXNlc1RvVmFycyh0YXJnZXRzLCB2YXJzKSB7XG4gICAgdmFyIGhhcm5lc3MgPSB0YXJnZXRzWzBdID8gX2dldENhY2hlKHRhcmdldHNbMF0pLmhhcm5lc3MgOiAwLFxuICAgICAgICBwcm9wZXJ0eUFsaWFzZXMgPSBoYXJuZXNzICYmIGhhcm5lc3MuYWxpYXNlcyxcbiAgICAgICAgY29weSxcbiAgICAgICAgcCxcbiAgICAgICAgaSxcbiAgICAgICAgYWxpYXNlcztcblxuICAgIGlmICghcHJvcGVydHlBbGlhc2VzKSB7XG4gICAgICByZXR1cm4gdmFycztcbiAgICB9XG5cbiAgICBjb3B5ID0gX21lcmdlKHt9LCB2YXJzKTtcblxuICAgIGZvciAocCBpbiBwcm9wZXJ0eUFsaWFzZXMpIHtcbiAgICAgIGlmIChwIGluIGNvcHkpIHtcbiAgICAgICAgYWxpYXNlcyA9IHByb3BlcnR5QWxpYXNlc1twXS5zcGxpdChcIixcIik7XG4gICAgICAgIGkgPSBhbGlhc2VzLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgY29weVthbGlhc2VzW2ldXSA9IGNvcHlbcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29weTtcbiAgfSxcbiAgICAgIF9wYXJzZUtleWZyYW1lID0gZnVuY3Rpb24gX3BhcnNlS2V5ZnJhbWUocHJvcCwgb2JqLCBhbGxQcm9wcywgZWFzZUVhY2gpIHtcbiAgICB2YXIgZWFzZSA9IG9iai5lYXNlIHx8IGVhc2VFYWNoIHx8IFwicG93ZXIxLmluT3V0XCIsXG4gICAgICAgIHAsXG4gICAgICAgIGE7XG5cbiAgICBpZiAoX2lzQXJyYXkob2JqKSkge1xuICAgICAgYSA9IGFsbFByb3BzW3Byb3BdIHx8IChhbGxQcm9wc1twcm9wXSA9IFtdKTtcbiAgICAgIG9iai5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICByZXR1cm4gYS5wdXNoKHtcbiAgICAgICAgICB0OiBpIC8gKG9iai5sZW5ndGggLSAxKSAqIDEwMCxcbiAgICAgICAgICB2OiB2YWx1ZSxcbiAgICAgICAgICBlOiBlYXNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAocCBpbiBvYmopIHtcbiAgICAgICAgYSA9IGFsbFByb3BzW3BdIHx8IChhbGxQcm9wc1twXSA9IFtdKTtcbiAgICAgICAgcCA9PT0gXCJlYXNlXCIgfHwgYS5wdXNoKHtcbiAgICAgICAgICB0OiBwYXJzZUZsb2F0KHByb3ApLFxuICAgICAgICAgIHY6IG9ialtwXSxcbiAgICAgICAgICBlOiBlYXNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgICAgIF9wYXJzZUZ1bmNPclN0cmluZyA9IGZ1bmN0aW9uIF9wYXJzZUZ1bmNPclN0cmluZyh2YWx1ZSwgdHdlZW4sIGksIHRhcmdldCwgdGFyZ2V0cykge1xuICAgIHJldHVybiBfaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKHR3ZWVuLCBpLCB0YXJnZXQsIHRhcmdldHMpIDogX2lzU3RyaW5nKHZhbHVlKSAmJiB+dmFsdWUuaW5kZXhPZihcInJhbmRvbShcIikgPyBfcmVwbGFjZVJhbmRvbSh2YWx1ZSkgOiB2YWx1ZTtcbiAgfSxcbiAgICAgIF9zdGFnZ2VyVHdlZW5Qcm9wcyA9IF9jYWxsYmFja05hbWVzICsgXCJyZXBlYXQscmVwZWF0RGVsYXkseW95byxyZXBlYXRSZWZyZXNoLHlveW9FYXNlXCIsXG4gICAgICBfc3RhZ2dlclByb3BzVG9Ta2lwID0ge307XG5cbiAgX2ZvckVhY2hOYW1lKF9zdGFnZ2VyVHdlZW5Qcm9wcyArIFwiLGlkLHN0YWdnZXIsZGVsYXksZHVyYXRpb24scGF1c2VkLHNjcm9sbFRyaWdnZXJcIiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gX3N0YWdnZXJQcm9wc1RvU2tpcFtuYW1lXSA9IDE7XG4gIH0pO1xuXG4gIHZhciBUd2VlbiA9IGZ1bmN0aW9uIChfQW5pbWF0aW9uMikge1xuICAgIF9pbmhlcml0c0xvb3NlKFR3ZWVuLCBfQW5pbWF0aW9uMik7XG5cbiAgICBmdW5jdGlvbiBUd2Vlbih0YXJnZXRzLCB2YXJzLCBwb3NpdGlvbiwgc2tpcEluaGVyaXQpIHtcbiAgICAgIHZhciBfdGhpczM7XG5cbiAgICAgIGlmICh0eXBlb2YgdmFycyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBwb3NpdGlvbi5kdXJhdGlvbiA9IHZhcnM7XG4gICAgICAgIHZhcnMgPSBwb3NpdGlvbjtcbiAgICAgICAgcG9zaXRpb24gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBfdGhpczMgPSBfQW5pbWF0aW9uMi5jYWxsKHRoaXMsIHNraXBJbmhlcml0ID8gdmFycyA6IF9pbmhlcml0RGVmYXVsdHModmFycykpIHx8IHRoaXM7XG4gICAgICB2YXIgX3RoaXMzJHZhcnMgPSBfdGhpczMudmFycyxcbiAgICAgICAgICBkdXJhdGlvbiA9IF90aGlzMyR2YXJzLmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5ID0gX3RoaXMzJHZhcnMuZGVsYXksXG4gICAgICAgICAgaW1tZWRpYXRlUmVuZGVyID0gX3RoaXMzJHZhcnMuaW1tZWRpYXRlUmVuZGVyLFxuICAgICAgICAgIHN0YWdnZXIgPSBfdGhpczMkdmFycy5zdGFnZ2VyLFxuICAgICAgICAgIG92ZXJ3cml0ZSA9IF90aGlzMyR2YXJzLm92ZXJ3cml0ZSxcbiAgICAgICAgICBrZXlmcmFtZXMgPSBfdGhpczMkdmFycy5rZXlmcmFtZXMsXG4gICAgICAgICAgZGVmYXVsdHMgPSBfdGhpczMkdmFycy5kZWZhdWx0cyxcbiAgICAgICAgICBzY3JvbGxUcmlnZ2VyID0gX3RoaXMzJHZhcnMuc2Nyb2xsVHJpZ2dlcixcbiAgICAgICAgICB5b3lvRWFzZSA9IF90aGlzMyR2YXJzLnlveW9FYXNlLFxuICAgICAgICAgIHBhcmVudCA9IHZhcnMucGFyZW50IHx8IF9nbG9iYWxUaW1lbGluZSxcbiAgICAgICAgICBwYXJzZWRUYXJnZXRzID0gKF9pc0FycmF5KHRhcmdldHMpIHx8IF9pc1R5cGVkQXJyYXkodGFyZ2V0cykgPyBfaXNOdW1iZXIodGFyZ2V0c1swXSkgOiBcImxlbmd0aFwiIGluIHZhcnMpID8gW3RhcmdldHNdIDogdG9BcnJheSh0YXJnZXRzKSxcbiAgICAgICAgICB0bCxcbiAgICAgICAgICBpLFxuICAgICAgICAgIGNvcHksXG4gICAgICAgICAgbCxcbiAgICAgICAgICBwLFxuICAgICAgICAgIGN1clRhcmdldCxcbiAgICAgICAgICBzdGFnZ2VyRnVuYyxcbiAgICAgICAgICBzdGFnZ2VyVmFyc1RvTWVyZ2U7XG4gICAgICBfdGhpczMuX3RhcmdldHMgPSBwYXJzZWRUYXJnZXRzLmxlbmd0aCA/IF9oYXJuZXNzKHBhcnNlZFRhcmdldHMpIDogX3dhcm4oXCJHU0FQIHRhcmdldCBcIiArIHRhcmdldHMgKyBcIiBub3QgZm91bmQuIGh0dHBzOi8vZ3JlZW5zb2NrLmNvbVwiLCAhX2NvbmZpZy5udWxsVGFyZ2V0V2FybikgfHwgW107XG4gICAgICBfdGhpczMuX3B0TG9va3VwID0gW107XG4gICAgICBfdGhpczMuX292ZXJ3cml0ZSA9IG92ZXJ3cml0ZTtcblxuICAgICAgaWYgKGtleWZyYW1lcyB8fCBzdGFnZ2VyIHx8IF9pc0Z1bmNPclN0cmluZyhkdXJhdGlvbikgfHwgX2lzRnVuY09yU3RyaW5nKGRlbGF5KSkge1xuICAgICAgICB2YXJzID0gX3RoaXMzLnZhcnM7XG4gICAgICAgIHRsID0gX3RoaXMzLnRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKHtcbiAgICAgICAgICBkYXRhOiBcIm5lc3RlZFwiLFxuICAgICAgICAgIGRlZmF1bHRzOiBkZWZhdWx0cyB8fCB7fVxuICAgICAgICB9KTtcbiAgICAgICAgdGwua2lsbCgpO1xuICAgICAgICB0bC5wYXJlbnQgPSB0bC5fZHAgPSBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyk7XG4gICAgICAgIHRsLl9zdGFydCA9IDA7XG5cbiAgICAgICAgaWYgKHN0YWdnZXIgfHwgX2lzRnVuY09yU3RyaW5nKGR1cmF0aW9uKSB8fCBfaXNGdW5jT3JTdHJpbmcoZGVsYXkpKSB7XG4gICAgICAgICAgbCA9IHBhcnNlZFRhcmdldHMubGVuZ3RoO1xuICAgICAgICAgIHN0YWdnZXJGdW5jID0gc3RhZ2dlciAmJiBkaXN0cmlidXRlKHN0YWdnZXIpO1xuXG4gICAgICAgICAgaWYgKF9pc09iamVjdChzdGFnZ2VyKSkge1xuICAgICAgICAgICAgZm9yIChwIGluIHN0YWdnZXIpIHtcbiAgICAgICAgICAgICAgaWYgKH5fc3RhZ2dlclR3ZWVuUHJvcHMuaW5kZXhPZihwKSkge1xuICAgICAgICAgICAgICAgIHN0YWdnZXJWYXJzVG9NZXJnZSB8fCAoc3RhZ2dlclZhcnNUb01lcmdlID0ge30pO1xuICAgICAgICAgICAgICAgIHN0YWdnZXJWYXJzVG9NZXJnZVtwXSA9IHN0YWdnZXJbcF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb3B5ID0gX2NvcHlFeGNsdWRpbmcodmFycywgX3N0YWdnZXJQcm9wc1RvU2tpcCk7XG4gICAgICAgICAgICBjb3B5LnN0YWdnZXIgPSAwO1xuICAgICAgICAgICAgeW95b0Vhc2UgJiYgKGNvcHkueW95b0Vhc2UgPSB5b3lvRWFzZSk7XG4gICAgICAgICAgICBzdGFnZ2VyVmFyc1RvTWVyZ2UgJiYgX21lcmdlKGNvcHksIHN0YWdnZXJWYXJzVG9NZXJnZSk7XG4gICAgICAgICAgICBjdXJUYXJnZXQgPSBwYXJzZWRUYXJnZXRzW2ldO1xuICAgICAgICAgICAgY29weS5kdXJhdGlvbiA9ICtfcGFyc2VGdW5jT3JTdHJpbmcoZHVyYXRpb24sIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSwgaSwgY3VyVGFyZ2V0LCBwYXJzZWRUYXJnZXRzKTtcbiAgICAgICAgICAgIGNvcHkuZGVsYXkgPSAoK19wYXJzZUZ1bmNPclN0cmluZyhkZWxheSwgX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpLCBpLCBjdXJUYXJnZXQsIHBhcnNlZFRhcmdldHMpIHx8IDApIC0gX3RoaXMzLl9kZWxheTtcblxuICAgICAgICAgICAgaWYgKCFzdGFnZ2VyICYmIGwgPT09IDEgJiYgY29weS5kZWxheSkge1xuICAgICAgICAgICAgICBfdGhpczMuX2RlbGF5ID0gZGVsYXkgPSBjb3B5LmRlbGF5O1xuICAgICAgICAgICAgICBfdGhpczMuX3N0YXJ0ICs9IGRlbGF5O1xuICAgICAgICAgICAgICBjb3B5LmRlbGF5ID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGwudG8oY3VyVGFyZ2V0LCBjb3B5LCBzdGFnZ2VyRnVuYyA/IHN0YWdnZXJGdW5jKGksIGN1clRhcmdldCwgcGFyc2VkVGFyZ2V0cykgOiAwKTtcbiAgICAgICAgICAgIHRsLl9lYXNlID0gX2Vhc2VNYXAubm9uZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0bC5kdXJhdGlvbigpID8gZHVyYXRpb24gPSBkZWxheSA9IDAgOiBfdGhpczMudGltZWxpbmUgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGtleWZyYW1lcykge1xuICAgICAgICAgIF9pbmhlcml0RGVmYXVsdHMoX3NldERlZmF1bHRzKHRsLnZhcnMuZGVmYXVsdHMsIHtcbiAgICAgICAgICAgIGVhc2U6IFwibm9uZVwiXG4gICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgdGwuX2Vhc2UgPSBfcGFyc2VFYXNlKGtleWZyYW1lcy5lYXNlIHx8IHZhcnMuZWFzZSB8fCBcIm5vbmVcIik7XG4gICAgICAgICAgdmFyIHRpbWUgPSAwLFxuICAgICAgICAgICAgICBhLFxuICAgICAgICAgICAgICBrZixcbiAgICAgICAgICAgICAgdjtcblxuICAgICAgICAgIGlmIChfaXNBcnJheShrZXlmcmFtZXMpKSB7XG4gICAgICAgICAgICBrZXlmcmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRsLnRvKHBhcnNlZFRhcmdldHMsIGZyYW1lLCBcIj5cIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29weSA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKHAgaW4ga2V5ZnJhbWVzKSB7XG4gICAgICAgICAgICAgIHAgPT09IFwiZWFzZVwiIHx8IHAgPT09IFwiZWFzZUVhY2hcIiB8fCBfcGFyc2VLZXlmcmFtZShwLCBrZXlmcmFtZXNbcF0sIGNvcHksIGtleWZyYW1lcy5lYXNlRWFjaCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAocCBpbiBjb3B5KSB7XG4gICAgICAgICAgICAgIGEgPSBjb3B5W3BdLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS50IC0gYi50O1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGltZSA9IDA7XG5cbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBrZiA9IGFbaV07XG4gICAgICAgICAgICAgICAgdiA9IHtcbiAgICAgICAgICAgICAgICAgIGVhc2U6IGtmLmUsXG4gICAgICAgICAgICAgICAgICBkdXJhdGlvbjogKGtmLnQgLSAoaSA/IGFbaSAtIDFdLnQgOiAwKSkgLyAxMDAgKiBkdXJhdGlvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdltwXSA9IGtmLnY7XG4gICAgICAgICAgICAgICAgdGwudG8ocGFyc2VkVGFyZ2V0cywgdiwgdGltZSk7XG4gICAgICAgICAgICAgICAgdGltZSArPSB2LmR1cmF0aW9uO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRsLmR1cmF0aW9uKCkgPCBkdXJhdGlvbiAmJiB0bC50byh7fSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLSB0bC5kdXJhdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkdXJhdGlvbiB8fCBfdGhpczMuZHVyYXRpb24oZHVyYXRpb24gPSB0bC5kdXJhdGlvbigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzMy50aW1lbGluZSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChvdmVyd3JpdGUgPT09IHRydWUgJiYgIV9zdXBwcmVzc092ZXJ3cml0ZXMpIHtcbiAgICAgICAgX292ZXJ3cml0aW5nVHdlZW4gPSBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyk7XG5cbiAgICAgICAgX2dsb2JhbFRpbWVsaW5lLmtpbGxUd2VlbnNPZihwYXJzZWRUYXJnZXRzKTtcblxuICAgICAgICBfb3ZlcndyaXRpbmdUd2VlbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIF9hZGRUb1RpbWVsaW5lKHBhcmVudCwgX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpLCBwb3NpdGlvbik7XG5cbiAgICAgIHZhcnMucmV2ZXJzZWQgJiYgX3RoaXMzLnJldmVyc2UoKTtcbiAgICAgIHZhcnMucGF1c2VkICYmIF90aGlzMy5wYXVzZWQodHJ1ZSk7XG5cbiAgICAgIGlmIChpbW1lZGlhdGVSZW5kZXIgfHwgIWR1cmF0aW9uICYmICFrZXlmcmFtZXMgJiYgX3RoaXMzLl9zdGFydCA9PT0gX3JvdW5kUHJlY2lzZShwYXJlbnQuX3RpbWUpICYmIF9pc05vdEZhbHNlKGltbWVkaWF0ZVJlbmRlcikgJiYgX2hhc05vUGF1c2VkQW5jZXN0b3JzKF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSkgJiYgcGFyZW50LmRhdGEgIT09IFwibmVzdGVkXCIpIHtcbiAgICAgICAgX3RoaXMzLl90VGltZSA9IC1fdGlueU51bTtcblxuICAgICAgICBfdGhpczMucmVuZGVyKE1hdGgubWF4KDAsIC1kZWxheSkpO1xuICAgICAgfVxuXG4gICAgICBzY3JvbGxUcmlnZ2VyICYmIF9zY3JvbGxUcmlnZ2VyKF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSwgc2Nyb2xsVHJpZ2dlcik7XG4gICAgICByZXR1cm4gX3RoaXMzO1xuICAgIH1cblxuICAgIHZhciBfcHJvdG8zID0gVHdlZW4ucHJvdG90eXBlO1xuXG4gICAgX3Byb3RvMy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIodG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpIHtcbiAgICAgIHZhciBwcmV2VGltZSA9IHRoaXMuX3RpbWUsXG4gICAgICAgICAgdER1ciA9IHRoaXMuX3REdXIsXG4gICAgICAgICAgZHVyID0gdGhpcy5fZHVyLFxuICAgICAgICAgIHRUaW1lID0gdG90YWxUaW1lID4gdER1ciAtIF90aW55TnVtICYmIHRvdGFsVGltZSA+PSAwID8gdER1ciA6IHRvdGFsVGltZSA8IF90aW55TnVtID8gMCA6IHRvdGFsVGltZSxcbiAgICAgICAgICB0aW1lLFxuICAgICAgICAgIHB0LFxuICAgICAgICAgIGl0ZXJhdGlvbixcbiAgICAgICAgICBjeWNsZUR1cmF0aW9uLFxuICAgICAgICAgIHByZXZJdGVyYXRpb24sXG4gICAgICAgICAgaXNZb3lvLFxuICAgICAgICAgIHJhdGlvLFxuICAgICAgICAgIHRpbWVsaW5lLFxuICAgICAgICAgIHlveW9FYXNlO1xuXG4gICAgICBpZiAoIWR1cikge1xuICAgICAgICBfcmVuZGVyWmVyb0R1cmF0aW9uVHdlZW4odGhpcywgdG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpO1xuICAgICAgfSBlbHNlIGlmICh0VGltZSAhPT0gdGhpcy5fdFRpbWUgfHwgIXRvdGFsVGltZSB8fCBmb3JjZSB8fCAhdGhpcy5faW5pdHRlZCAmJiB0aGlzLl90VGltZSB8fCB0aGlzLl9zdGFydEF0ICYmIHRoaXMuX3pUaW1lIDwgMCAhPT0gdG90YWxUaW1lIDwgMCkge1xuICAgICAgICB0aW1lID0gdFRpbWU7XG4gICAgICAgIHRpbWVsaW5lID0gdGhpcy50aW1lbGluZTtcblxuICAgICAgICBpZiAodGhpcy5fcmVwZWF0KSB7XG4gICAgICAgICAgY3ljbGVEdXJhdGlvbiA9IGR1ciArIHRoaXMuX3JEZWxheTtcblxuICAgICAgICAgIGlmICh0aGlzLl9yZXBlYXQgPCAtMSAmJiB0b3RhbFRpbWUgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b3RhbFRpbWUoY3ljbGVEdXJhdGlvbiAqIDEwMCArIHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aW1lID0gX3JvdW5kUHJlY2lzZSh0VGltZSAlIGN5Y2xlRHVyYXRpb24pO1xuXG4gICAgICAgICAgaWYgKHRUaW1lID09PSB0RHVyKSB7XG4gICAgICAgICAgICBpdGVyYXRpb24gPSB0aGlzLl9yZXBlYXQ7XG4gICAgICAgICAgICB0aW1lID0gZHVyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVyYXRpb24gPSB+fih0VGltZSAvIGN5Y2xlRHVyYXRpb24pO1xuXG4gICAgICAgICAgICBpZiAoaXRlcmF0aW9uICYmIGl0ZXJhdGlvbiA9PT0gdFRpbWUgLyBjeWNsZUR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgIHRpbWUgPSBkdXI7XG4gICAgICAgICAgICAgIGl0ZXJhdGlvbi0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aW1lID4gZHVyICYmICh0aW1lID0gZHVyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpc1lveW8gPSB0aGlzLl95b3lvICYmIGl0ZXJhdGlvbiAmIDE7XG5cbiAgICAgICAgICBpZiAoaXNZb3lvKSB7XG4gICAgICAgICAgICB5b3lvRWFzZSA9IHRoaXMuX3lFYXNlO1xuICAgICAgICAgICAgdGltZSA9IGR1ciAtIHRpbWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJldkl0ZXJhdGlvbiA9IF9hbmltYXRpb25DeWNsZSh0aGlzLl90VGltZSwgY3ljbGVEdXJhdGlvbik7XG5cbiAgICAgICAgICBpZiAodGltZSA9PT0gcHJldlRpbWUgJiYgIWZvcmNlICYmIHRoaXMuX2luaXR0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpdGVyYXRpb24gIT09IHByZXZJdGVyYXRpb24pIHtcbiAgICAgICAgICAgIHRpbWVsaW5lICYmIHRoaXMuX3lFYXNlICYmIF9wcm9wYWdhdGVZb3lvRWFzZSh0aW1lbGluZSwgaXNZb3lvKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmFycy5yZXBlYXRSZWZyZXNoICYmICFpc1lveW8gJiYgIXRoaXMuX2xvY2spIHtcbiAgICAgICAgICAgICAgdGhpcy5fbG9jayA9IGZvcmNlID0gMTtcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoX3JvdW5kUHJlY2lzZShjeWNsZUR1cmF0aW9uICogaXRlcmF0aW9uKSwgdHJ1ZSkuaW52YWxpZGF0ZSgpLl9sb2NrID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2luaXR0ZWQpIHtcbiAgICAgICAgICBpZiAoX2F0dGVtcHRJbml0VHdlZW4odGhpcywgdG90YWxUaW1lIDwgMCA/IHRvdGFsVGltZSA6IHRpbWUsIGZvcmNlLCBzdXBwcmVzc0V2ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuX3RUaW1lID0gMDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkdXIgIT09IHRoaXMuX2R1cikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90VGltZSA9IHRUaW1lO1xuICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcblxuICAgICAgICBpZiAoIXRoaXMuX2FjdCAmJiB0aGlzLl90cykge1xuICAgICAgICAgIHRoaXMuX2FjdCA9IDE7XG4gICAgICAgICAgdGhpcy5fbGF6eSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJhdGlvID0gcmF0aW8gPSAoeW95b0Vhc2UgfHwgdGhpcy5fZWFzZSkodGltZSAvIGR1cik7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Zyb20pIHtcbiAgICAgICAgICB0aGlzLnJhdGlvID0gcmF0aW8gPSAxIC0gcmF0aW87XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGltZSAmJiAhcHJldlRpbWUgJiYgIXN1cHByZXNzRXZlbnRzKSB7XG4gICAgICAgICAgX2NhbGxiYWNrKHRoaXMsIFwib25TdGFydFwiKTtcblxuICAgICAgICAgIGlmICh0aGlzLl90VGltZSAhPT0gdFRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB0ID0gdGhpcy5fcHQ7XG5cbiAgICAgICAgd2hpbGUgKHB0KSB7XG4gICAgICAgICAgcHQucihyYXRpbywgcHQuZCk7XG4gICAgICAgICAgcHQgPSBwdC5fbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWVsaW5lICYmIHRpbWVsaW5lLnJlbmRlcih0b3RhbFRpbWUgPCAwID8gdG90YWxUaW1lIDogIXRpbWUgJiYgaXNZb3lvID8gLV90aW55TnVtIDogdGltZWxpbmUuX2R1ciAqIHRpbWVsaW5lLl9lYXNlKHRpbWUgLyB0aGlzLl9kdXIpLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpIHx8IHRoaXMuX3N0YXJ0QXQgJiYgKHRoaXMuX3pUaW1lID0gdG90YWxUaW1lKTtcblxuICAgICAgICBpZiAodGhpcy5fb25VcGRhdGUgJiYgIXN1cHByZXNzRXZlbnRzKSB7XG4gICAgICAgICAgdG90YWxUaW1lIDwgMCAmJiB0aGlzLl9zdGFydEF0ICYmIHRoaXMuX3N0YXJ0QXQucmVuZGVyKHRvdGFsVGltZSwgdHJ1ZSwgZm9yY2UpO1xuXG4gICAgICAgICAgX2NhbGxiYWNrKHRoaXMsIFwib25VcGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yZXBlYXQgJiYgaXRlcmF0aW9uICE9PSBwcmV2SXRlcmF0aW9uICYmIHRoaXMudmFycy5vblJlcGVhdCAmJiAhc3VwcHJlc3NFdmVudHMgJiYgdGhpcy5wYXJlbnQgJiYgX2NhbGxiYWNrKHRoaXMsIFwib25SZXBlYXRcIik7XG5cbiAgICAgICAgaWYgKCh0VGltZSA9PT0gdGhpcy5fdER1ciB8fCAhdFRpbWUpICYmIHRoaXMuX3RUaW1lID09PSB0VGltZSkge1xuICAgICAgICAgIHRvdGFsVGltZSA8IDAgJiYgdGhpcy5fc3RhcnRBdCAmJiAhdGhpcy5fb25VcGRhdGUgJiYgdGhpcy5fc3RhcnRBdC5yZW5kZXIodG90YWxUaW1lLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAodG90YWxUaW1lIHx8ICFkdXIpICYmICh0VGltZSA9PT0gdGhpcy5fdER1ciAmJiB0aGlzLl90cyA+IDAgfHwgIXRUaW1lICYmIHRoaXMuX3RzIDwgMCkgJiYgX3JlbW92ZUZyb21QYXJlbnQodGhpcywgMSk7XG5cbiAgICAgICAgICBpZiAoIXN1cHByZXNzRXZlbnRzICYmICEodG90YWxUaW1lIDwgMCAmJiAhcHJldlRpbWUpICYmICh0VGltZSB8fCBwcmV2VGltZSkpIHtcbiAgICAgICAgICAgIF9jYWxsYmFjayh0aGlzLCB0VGltZSA9PT0gdER1ciA/IFwib25Db21wbGV0ZVwiIDogXCJvblJldmVyc2VDb21wbGV0ZVwiLCB0cnVlKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJvbSAmJiAhKHRUaW1lIDwgdER1ciAmJiB0aGlzLnRpbWVTY2FsZSgpID4gMCkgJiYgdGhpcy5fcHJvbSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMy50YXJnZXRzID0gZnVuY3Rpb24gdGFyZ2V0cygpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXRzO1xuICAgIH07XG5cbiAgICBfcHJvdG8zLmludmFsaWRhdGUgPSBmdW5jdGlvbiBpbnZhbGlkYXRlKCkge1xuICAgICAgdGhpcy5fcHQgPSB0aGlzLl9vcCA9IHRoaXMuX3N0YXJ0QXQgPSB0aGlzLl9vblVwZGF0ZSA9IHRoaXMuX2xhenkgPSB0aGlzLnJhdGlvID0gMDtcbiAgICAgIHRoaXMuX3B0TG9va3VwID0gW107XG4gICAgICB0aGlzLnRpbWVsaW5lICYmIHRoaXMudGltZWxpbmUuaW52YWxpZGF0ZSgpO1xuICAgICAgcmV0dXJuIF9BbmltYXRpb24yLnByb3RvdHlwZS5pbnZhbGlkYXRlLmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIF9wcm90bzMua2lsbCA9IGZ1bmN0aW9uIGtpbGwodGFyZ2V0cywgdmFycykge1xuICAgICAgaWYgKHZhcnMgPT09IHZvaWQgMCkge1xuICAgICAgICB2YXJzID0gXCJhbGxcIjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0YXJnZXRzICYmICghdmFycyB8fCB2YXJzID09PSBcImFsbFwiKSkge1xuICAgICAgICB0aGlzLl9sYXp5ID0gdGhpcy5fcHQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyBfaW50ZXJydXB0KHRoaXMpIDogdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudGltZWxpbmUpIHtcbiAgICAgICAgdmFyIHREdXIgPSB0aGlzLnRpbWVsaW5lLnRvdGFsRHVyYXRpb24oKTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5raWxsVHdlZW5zT2YodGFyZ2V0cywgdmFycywgX292ZXJ3cml0aW5nVHdlZW4gJiYgX292ZXJ3cml0aW5nVHdlZW4udmFycy5vdmVyd3JpdGUgIT09IHRydWUpLl9maXJzdCB8fCBfaW50ZXJydXB0KHRoaXMpO1xuICAgICAgICB0aGlzLnBhcmVudCAmJiB0RHVyICE9PSB0aGlzLnRpbWVsaW5lLnRvdGFsRHVyYXRpb24oKSAmJiBfc2V0RHVyYXRpb24odGhpcywgdGhpcy5fZHVyICogdGhpcy50aW1lbGluZS5fdER1ciAvIHREdXIsIDAsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcnNlZFRhcmdldHMgPSB0aGlzLl90YXJnZXRzLFxuICAgICAgICAgIGtpbGxpbmdUYXJnZXRzID0gdGFyZ2V0cyA/IHRvQXJyYXkodGFyZ2V0cykgOiBwYXJzZWRUYXJnZXRzLFxuICAgICAgICAgIHByb3BUd2Vlbkxvb2t1cCA9IHRoaXMuX3B0TG9va3VwLFxuICAgICAgICAgIGZpcnN0UFQgPSB0aGlzLl9wdCxcbiAgICAgICAgICBvdmVyd3JpdHRlblByb3BzLFxuICAgICAgICAgIGN1ckxvb2t1cCxcbiAgICAgICAgICBjdXJPdmVyd3JpdGVQcm9wcyxcbiAgICAgICAgICBwcm9wcyxcbiAgICAgICAgICBwLFxuICAgICAgICAgIHB0LFxuICAgICAgICAgIGk7XG5cbiAgICAgIGlmICgoIXZhcnMgfHwgdmFycyA9PT0gXCJhbGxcIikgJiYgX2FycmF5c01hdGNoKHBhcnNlZFRhcmdldHMsIGtpbGxpbmdUYXJnZXRzKSkge1xuICAgICAgICB2YXJzID09PSBcImFsbFwiICYmICh0aGlzLl9wdCA9IDApO1xuICAgICAgICByZXR1cm4gX2ludGVycnVwdCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgb3ZlcndyaXR0ZW5Qcm9wcyA9IHRoaXMuX29wID0gdGhpcy5fb3AgfHwgW107XG5cbiAgICAgIGlmICh2YXJzICE9PSBcImFsbFwiKSB7XG4gICAgICAgIGlmIChfaXNTdHJpbmcodmFycykpIHtcbiAgICAgICAgICBwID0ge307XG5cbiAgICAgICAgICBfZm9yRWFjaE5hbWUodmFycywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBwW25hbWVdID0gMTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhcnMgPSBwO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFycyA9IF9hZGRBbGlhc2VzVG9WYXJzKHBhcnNlZFRhcmdldHMsIHZhcnMpO1xuICAgICAgfVxuXG4gICAgICBpID0gcGFyc2VkVGFyZ2V0cy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKH5raWxsaW5nVGFyZ2V0cy5pbmRleE9mKHBhcnNlZFRhcmdldHNbaV0pKSB7XG4gICAgICAgICAgY3VyTG9va3VwID0gcHJvcFR3ZWVuTG9va3VwW2ldO1xuXG4gICAgICAgICAgaWYgKHZhcnMgPT09IFwiYWxsXCIpIHtcbiAgICAgICAgICAgIG92ZXJ3cml0dGVuUHJvcHNbaV0gPSB2YXJzO1xuICAgICAgICAgICAgcHJvcHMgPSBjdXJMb29rdXA7XG4gICAgICAgICAgICBjdXJPdmVyd3JpdGVQcm9wcyA9IHt9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJPdmVyd3JpdGVQcm9wcyA9IG92ZXJ3cml0dGVuUHJvcHNbaV0gPSBvdmVyd3JpdHRlblByb3BzW2ldIHx8IHt9O1xuICAgICAgICAgICAgcHJvcHMgPSB2YXJzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAocCBpbiBwcm9wcykge1xuICAgICAgICAgICAgcHQgPSBjdXJMb29rdXAgJiYgY3VyTG9va3VwW3BdO1xuXG4gICAgICAgICAgICBpZiAocHQpIHtcbiAgICAgICAgICAgICAgaWYgKCEoXCJraWxsXCIgaW4gcHQuZCkgfHwgcHQuZC5raWxsKHApID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgX3JlbW92ZUxpbmtlZExpc3RJdGVtKHRoaXMsIHB0LCBcIl9wdFwiKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGRlbGV0ZSBjdXJMb29rdXBbcF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJPdmVyd3JpdGVQcm9wcyAhPT0gXCJhbGxcIikge1xuICAgICAgICAgICAgICBjdXJPdmVyd3JpdGVQcm9wc1twXSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2luaXR0ZWQgJiYgIXRoaXMuX3B0ICYmIGZpcnN0UFQgJiYgX2ludGVycnVwdCh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBUd2Vlbi50byA9IGZ1bmN0aW9uIHRvKHRhcmdldHMsIHZhcnMpIHtcbiAgICAgIHJldHVybiBuZXcgVHdlZW4odGFyZ2V0cywgdmFycywgYXJndW1lbnRzWzJdKTtcbiAgICB9O1xuXG4gICAgVHdlZW4uZnJvbSA9IGZ1bmN0aW9uIGZyb20odGFyZ2V0cywgdmFycykge1xuICAgICAgcmV0dXJuIF9jcmVhdGVUd2VlblR5cGUoMSwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgVHdlZW4uZGVsYXllZENhbGwgPSBmdW5jdGlvbiBkZWxheWVkQ2FsbChkZWxheSwgY2FsbGJhY2ssIHBhcmFtcywgc2NvcGUpIHtcbiAgICAgIHJldHVybiBuZXcgVHdlZW4oY2FsbGJhY2ssIDAsIHtcbiAgICAgICAgaW1tZWRpYXRlUmVuZGVyOiBmYWxzZSxcbiAgICAgICAgbGF6eTogZmFsc2UsXG4gICAgICAgIG92ZXJ3cml0ZTogZmFsc2UsXG4gICAgICAgIGRlbGF5OiBkZWxheSxcbiAgICAgICAgb25Db21wbGV0ZTogY2FsbGJhY2ssXG4gICAgICAgIG9uUmV2ZXJzZUNvbXBsZXRlOiBjYWxsYmFjayxcbiAgICAgICAgb25Db21wbGV0ZVBhcmFtczogcGFyYW1zLFxuICAgICAgICBvblJldmVyc2VDb21wbGV0ZVBhcmFtczogcGFyYW1zLFxuICAgICAgICBjYWxsYmFja1Njb3BlOiBzY29wZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFR3ZWVuLmZyb21UbyA9IGZ1bmN0aW9uIGZyb21Ubyh0YXJnZXRzLCBmcm9tVmFycywgdG9WYXJzKSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZVR3ZWVuVHlwZSgyLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBUd2Vlbi5zZXQgPSBmdW5jdGlvbiBzZXQodGFyZ2V0cywgdmFycykge1xuICAgICAgdmFycy5kdXJhdGlvbiA9IDA7XG4gICAgICB2YXJzLnJlcGVhdERlbGF5IHx8ICh2YXJzLnJlcGVhdCA9IDApO1xuICAgICAgcmV0dXJuIG5ldyBUd2Vlbih0YXJnZXRzLCB2YXJzKTtcbiAgICB9O1xuXG4gICAgVHdlZW4ua2lsbFR3ZWVuc09mID0gZnVuY3Rpb24ga2lsbFR3ZWVuc09mKHRhcmdldHMsIHByb3BzLCBvbmx5QWN0aXZlKSB7XG4gICAgICByZXR1cm4gX2dsb2JhbFRpbWVsaW5lLmtpbGxUd2VlbnNPZih0YXJnZXRzLCBwcm9wcywgb25seUFjdGl2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBUd2VlbjtcbiAgfShBbmltYXRpb24pO1xuXG4gIF9zZXREZWZhdWx0cyhUd2Vlbi5wcm90b3R5cGUsIHtcbiAgICBfdGFyZ2V0czogW10sXG4gICAgX2xhenk6IDAsXG4gICAgX3N0YXJ0QXQ6IDAsXG4gICAgX29wOiAwLFxuICAgIF9vbkluaXQ6IDBcbiAgfSk7XG5cbiAgX2ZvckVhY2hOYW1lKFwic3RhZ2dlclRvLHN0YWdnZXJGcm9tLHN0YWdnZXJGcm9tVG9cIiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBUd2VlbltuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0bCA9IG5ldyBUaW1lbGluZSgpLFxuICAgICAgICAgIHBhcmFtcyA9IF9zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICAgIHBhcmFtcy5zcGxpY2UobmFtZSA9PT0gXCJzdGFnZ2VyRnJvbVRvXCIgPyA1IDogNCwgMCwgMCk7XG4gICAgICByZXR1cm4gdGxbbmFtZV0uYXBwbHkodGwsIHBhcmFtcyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIF9zZXR0ZXJQbGFpbiA9IGZ1bmN0aW9uIF9zZXR0ZXJQbGFpbih0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXRbcHJvcGVydHldID0gdmFsdWU7XG4gIH0sXG4gICAgICBfc2V0dGVyRnVuYyA9IGZ1bmN0aW9uIF9zZXR0ZXJGdW5jKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldFtwcm9wZXJ0eV0odmFsdWUpO1xuICB9LFxuICAgICAgX3NldHRlckZ1bmNXaXRoUGFyYW0gPSBmdW5jdGlvbiBfc2V0dGVyRnVuY1dpdGhQYXJhbSh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgZGF0YSkge1xuICAgIHJldHVybiB0YXJnZXRbcHJvcGVydHldKGRhdGEuZnAsIHZhbHVlKTtcbiAgfSxcbiAgICAgIF9zZXR0ZXJBdHRyaWJ1dGUgPSBmdW5jdGlvbiBfc2V0dGVyQXR0cmlidXRlKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldC5zZXRBdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKTtcbiAgfSxcbiAgICAgIF9nZXRTZXR0ZXIgPSBmdW5jdGlvbiBfZ2V0U2V0dGVyKHRhcmdldCwgcHJvcGVydHkpIHtcbiAgICByZXR1cm4gX2lzRnVuY3Rpb24odGFyZ2V0W3Byb3BlcnR5XSkgPyBfc2V0dGVyRnVuYyA6IF9pc1VuZGVmaW5lZCh0YXJnZXRbcHJvcGVydHldKSAmJiB0YXJnZXQuc2V0QXR0cmlidXRlID8gX3NldHRlckF0dHJpYnV0ZSA6IF9zZXR0ZXJQbGFpbjtcbiAgfSxcbiAgICAgIF9yZW5kZXJQbGFpbiA9IGZ1bmN0aW9uIF9yZW5kZXJQbGFpbihyYXRpbywgZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnNldChkYXRhLnQsIGRhdGEucCwgTWF0aC5yb3VuZCgoZGF0YS5zICsgZGF0YS5jICogcmF0aW8pICogMTAwMDAwMCkgLyAxMDAwMDAwLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJCb29sZWFuID0gZnVuY3Rpb24gX3JlbmRlckJvb2xlYW4ocmF0aW8sIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsICEhKGRhdGEucyArIGRhdGEuYyAqIHJhdGlvKSwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyQ29tcGxleFN0cmluZyA9IGZ1bmN0aW9uIF9yZW5kZXJDb21wbGV4U3RyaW5nKHJhdGlvLCBkYXRhKSB7XG4gICAgdmFyIHB0ID0gZGF0YS5fcHQsXG4gICAgICAgIHMgPSBcIlwiO1xuXG4gICAgaWYgKCFyYXRpbyAmJiBkYXRhLmIpIHtcbiAgICAgIHMgPSBkYXRhLmI7XG4gICAgfSBlbHNlIGlmIChyYXRpbyA9PT0gMSAmJiBkYXRhLmUpIHtcbiAgICAgIHMgPSBkYXRhLmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChwdCkge1xuICAgICAgICBzID0gcHQucCArIChwdC5tID8gcHQubShwdC5zICsgcHQuYyAqIHJhdGlvKSA6IE1hdGgucm91bmQoKHB0LnMgKyBwdC5jICogcmF0aW8pICogMTAwMDApIC8gMTAwMDApICsgcztcbiAgICAgICAgcHQgPSBwdC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgcyArPSBkYXRhLmM7XG4gICAgfVxuXG4gICAgZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsIHMsIGRhdGEpO1xuICB9LFxuICAgICAgX3JlbmRlclByb3BUd2VlbnMgPSBmdW5jdGlvbiBfcmVuZGVyUHJvcFR3ZWVucyhyYXRpbywgZGF0YSkge1xuICAgIHZhciBwdCA9IGRhdGEuX3B0O1xuXG4gICAgd2hpbGUgKHB0KSB7XG4gICAgICBwdC5yKHJhdGlvLCBwdC5kKTtcbiAgICAgIHB0ID0gcHQuX25leHQ7XG4gICAgfVxuICB9LFxuICAgICAgX2FkZFBsdWdpbk1vZGlmaWVyID0gZnVuY3Rpb24gX2FkZFBsdWdpbk1vZGlmaWVyKG1vZGlmaWVyLCB0d2VlbiwgdGFyZ2V0LCBwcm9wZXJ0eSkge1xuICAgIHZhciBwdCA9IHRoaXMuX3B0LFxuICAgICAgICBuZXh0O1xuXG4gICAgd2hpbGUgKHB0KSB7XG4gICAgICBuZXh0ID0gcHQuX25leHQ7XG4gICAgICBwdC5wID09PSBwcm9wZXJ0eSAmJiBwdC5tb2RpZmllcihtb2RpZmllciwgdHdlZW4sIHRhcmdldCk7XG4gICAgICBwdCA9IG5leHQ7XG4gICAgfVxuICB9LFxuICAgICAgX2tpbGxQcm9wVHdlZW5zT2YgPSBmdW5jdGlvbiBfa2lsbFByb3BUd2VlbnNPZihwcm9wZXJ0eSkge1xuICAgIHZhciBwdCA9IHRoaXMuX3B0LFxuICAgICAgICBoYXNOb25EZXBlbmRlbnRSZW1haW5pbmcsXG4gICAgICAgIG5leHQ7XG5cbiAgICB3aGlsZSAocHQpIHtcbiAgICAgIG5leHQgPSBwdC5fbmV4dDtcblxuICAgICAgaWYgKHB0LnAgPT09IHByb3BlcnR5ICYmICFwdC5vcCB8fCBwdC5vcCA9PT0gcHJvcGVydHkpIHtcbiAgICAgICAgX3JlbW92ZUxpbmtlZExpc3RJdGVtKHRoaXMsIHB0LCBcIl9wdFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoIXB0LmRlcCkge1xuICAgICAgICBoYXNOb25EZXBlbmRlbnRSZW1haW5pbmcgPSAxO1xuICAgICAgfVxuXG4gICAgICBwdCA9IG5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuICFoYXNOb25EZXBlbmRlbnRSZW1haW5pbmc7XG4gIH0sXG4gICAgICBfc2V0dGVyV2l0aE1vZGlmaWVyID0gZnVuY3Rpb24gX3NldHRlcldpdGhNb2RpZmllcih0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgZGF0YSkge1xuICAgIGRhdGEubVNldCh0YXJnZXQsIHByb3BlcnR5LCBkYXRhLm0uY2FsbChkYXRhLnR3ZWVuLCB2YWx1ZSwgZGF0YS5tdCksIGRhdGEpO1xuICB9LFxuICAgICAgX3NvcnRQcm9wVHdlZW5zQnlQcmlvcml0eSA9IGZ1bmN0aW9uIF9zb3J0UHJvcFR3ZWVuc0J5UHJpb3JpdHkocGFyZW50KSB7XG4gICAgdmFyIHB0ID0gcGFyZW50Ll9wdCxcbiAgICAgICAgbmV4dCxcbiAgICAgICAgcHQyLFxuICAgICAgICBmaXJzdCxcbiAgICAgICAgbGFzdDtcblxuICAgIHdoaWxlIChwdCkge1xuICAgICAgbmV4dCA9IHB0Ll9uZXh0O1xuICAgICAgcHQyID0gZmlyc3Q7XG5cbiAgICAgIHdoaWxlIChwdDIgJiYgcHQyLnByID4gcHQucHIpIHtcbiAgICAgICAgcHQyID0gcHQyLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICBpZiAocHQuX3ByZXYgPSBwdDIgPyBwdDIuX3ByZXYgOiBsYXN0KSB7XG4gICAgICAgIHB0Ll9wcmV2Ll9uZXh0ID0gcHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaXJzdCA9IHB0O1xuICAgICAgfVxuXG4gICAgICBpZiAocHQuX25leHQgPSBwdDIpIHtcbiAgICAgICAgcHQyLl9wcmV2ID0gcHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXN0ID0gcHQ7XG4gICAgICB9XG5cbiAgICAgIHB0ID0gbmV4dDtcbiAgICB9XG5cbiAgICBwYXJlbnQuX3B0ID0gZmlyc3Q7XG4gIH07XG5cbiAgdmFyIFByb3BUd2VlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQcm9wVHdlZW4obmV4dCwgdGFyZ2V0LCBwcm9wLCBzdGFydCwgY2hhbmdlLCByZW5kZXJlciwgZGF0YSwgc2V0dGVyLCBwcmlvcml0eSkge1xuICAgICAgdGhpcy50ID0gdGFyZ2V0O1xuICAgICAgdGhpcy5zID0gc3RhcnQ7XG4gICAgICB0aGlzLmMgPSBjaGFuZ2U7XG4gICAgICB0aGlzLnAgPSBwcm9wO1xuICAgICAgdGhpcy5yID0gcmVuZGVyZXIgfHwgX3JlbmRlclBsYWluO1xuICAgICAgdGhpcy5kID0gZGF0YSB8fCB0aGlzO1xuICAgICAgdGhpcy5zZXQgPSBzZXR0ZXIgfHwgX3NldHRlclBsYWluO1xuICAgICAgdGhpcy5wciA9IHByaW9yaXR5IHx8IDA7XG4gICAgICB0aGlzLl9uZXh0ID0gbmV4dDtcblxuICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgbmV4dC5fcHJldiA9IHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF9wcm90bzQgPSBQcm9wVHdlZW4ucHJvdG90eXBlO1xuXG4gICAgX3Byb3RvNC5tb2RpZmllciA9IGZ1bmN0aW9uIG1vZGlmaWVyKGZ1bmMsIHR3ZWVuLCB0YXJnZXQpIHtcbiAgICAgIHRoaXMubVNldCA9IHRoaXMubVNldCB8fCB0aGlzLnNldDtcbiAgICAgIHRoaXMuc2V0ID0gX3NldHRlcldpdGhNb2RpZmllcjtcbiAgICAgIHRoaXMubSA9IGZ1bmM7XG4gICAgICB0aGlzLm10ID0gdGFyZ2V0O1xuICAgICAgdGhpcy50d2VlbiA9IHR3ZWVuO1xuICAgIH07XG5cbiAgICByZXR1cm4gUHJvcFR3ZWVuO1xuICB9KCk7XG5cbiAgX2ZvckVhY2hOYW1lKF9jYWxsYmFja05hbWVzICsgXCJwYXJlbnQsZHVyYXRpb24sZWFzZSxkZWxheSxvdmVyd3JpdGUscnVuQmFja3dhcmRzLHN0YXJ0QXQseW95byxpbW1lZGlhdGVSZW5kZXIscmVwZWF0LHJlcGVhdERlbGF5LGRhdGEscGF1c2VkLHJldmVyc2VkLGxhenksY2FsbGJhY2tTY29wZSxzdHJpbmdGaWx0ZXIsaWQseW95b0Vhc2Usc3RhZ2dlcixpbmhlcml0LHJlcGVhdFJlZnJlc2gsa2V5ZnJhbWVzLGF1dG9SZXZlcnQsc2Nyb2xsVHJpZ2dlclwiLCBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBfcmVzZXJ2ZWRQcm9wc1tuYW1lXSA9IDE7XG4gIH0pO1xuXG4gIF9nbG9iYWxzLlR3ZWVuTWF4ID0gX2dsb2JhbHMuVHdlZW5MaXRlID0gVHdlZW47XG4gIF9nbG9iYWxzLlRpbWVsaW5lTGl0ZSA9IF9nbG9iYWxzLlRpbWVsaW5lTWF4ID0gVGltZWxpbmU7XG4gIF9nbG9iYWxUaW1lbGluZSA9IG5ldyBUaW1lbGluZSh7XG4gICAgc29ydENoaWxkcmVuOiBmYWxzZSxcbiAgICBkZWZhdWx0czogX2RlZmF1bHRzLFxuICAgIGF1dG9SZW1vdmVDaGlsZHJlbjogdHJ1ZSxcbiAgICBpZDogXCJyb290XCIsXG4gICAgc21vb3RoQ2hpbGRUaW1pbmc6IHRydWVcbiAgfSk7XG4gIF9jb25maWcuc3RyaW5nRmlsdGVyID0gX2NvbG9yU3RyaW5nRmlsdGVyO1xuICB2YXIgX2dzYXAgPSB7XG4gICAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luKCkge1xuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIF9jcmVhdGVQbHVnaW4oY29uZmlnKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdGltZWxpbmU6IGZ1bmN0aW9uIHRpbWVsaW5lKHZhcnMpIHtcbiAgICAgIHJldHVybiBuZXcgVGltZWxpbmUodmFycyk7XG4gICAgfSxcbiAgICBnZXRUd2VlbnNPZjogZnVuY3Rpb24gZ2V0VHdlZW5zT2YodGFyZ2V0cywgb25seUFjdGl2ZSkge1xuICAgICAgcmV0dXJuIF9nbG9iYWxUaW1lbGluZS5nZXRUd2VlbnNPZih0YXJnZXRzLCBvbmx5QWN0aXZlKTtcbiAgICB9LFxuICAgIGdldFByb3BlcnR5OiBmdW5jdGlvbiBnZXRQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5LCB1bml0LCB1bmNhY2hlKSB7XG4gICAgICBfaXNTdHJpbmcodGFyZ2V0KSAmJiAodGFyZ2V0ID0gdG9BcnJheSh0YXJnZXQpWzBdKTtcblxuICAgICAgdmFyIGdldHRlciA9IF9nZXRDYWNoZSh0YXJnZXQgfHwge30pLmdldCxcbiAgICAgICAgICBmb3JtYXQgPSB1bml0ID8gX3Bhc3NUaHJvdWdoIDogX251bWVyaWNJZlBvc3NpYmxlO1xuXG4gICAgICB1bml0ID09PSBcIm5hdGl2ZVwiICYmICh1bml0ID0gXCJcIik7XG4gICAgICByZXR1cm4gIXRhcmdldCA/IHRhcmdldCA6ICFwcm9wZXJ0eSA/IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdW5pdCwgdW5jYWNoZSkge1xuICAgICAgICByZXR1cm4gZm9ybWF0KChfcGx1Z2luc1twcm9wZXJ0eV0gJiYgX3BsdWdpbnNbcHJvcGVydHldLmdldCB8fCBnZXR0ZXIpKHRhcmdldCwgcHJvcGVydHksIHVuaXQsIHVuY2FjaGUpKTtcbiAgICAgIH0gOiBmb3JtYXQoKF9wbHVnaW5zW3Byb3BlcnR5XSAmJiBfcGx1Z2luc1twcm9wZXJ0eV0uZ2V0IHx8IGdldHRlcikodGFyZ2V0LCBwcm9wZXJ0eSwgdW5pdCwgdW5jYWNoZSkpO1xuICAgIH0sXG4gICAgcXVpY2tTZXR0ZXI6IGZ1bmN0aW9uIHF1aWNrU2V0dGVyKHRhcmdldCwgcHJvcGVydHksIHVuaXQpIHtcbiAgICAgIHRhcmdldCA9IHRvQXJyYXkodGFyZ2V0KTtcblxuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBzZXR0ZXJzID0gdGFyZ2V0Lm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgIHJldHVybiBnc2FwLnF1aWNrU2V0dGVyKHQsIHByb3BlcnR5LCB1bml0KTtcbiAgICAgICAgfSksXG4gICAgICAgICAgICBsID0gc2V0dGVycy5sZW5ndGg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB2YXIgaSA9IGw7XG5cbiAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBzZXR0ZXJzW2ldKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHRhcmdldCA9IHRhcmdldFswXSB8fCB7fTtcblxuICAgICAgdmFyIFBsdWdpbiA9IF9wbHVnaW5zW3Byb3BlcnR5XSxcbiAgICAgICAgICBjYWNoZSA9IF9nZXRDYWNoZSh0YXJnZXQpLFxuICAgICAgICAgIHAgPSBjYWNoZS5oYXJuZXNzICYmIChjYWNoZS5oYXJuZXNzLmFsaWFzZXMgfHwge30pW3Byb3BlcnR5XSB8fCBwcm9wZXJ0eSxcbiAgICAgICAgICBzZXR0ZXIgPSBQbHVnaW4gPyBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHAgPSBuZXcgUGx1Z2luKCk7XG4gICAgICAgIF9xdWlja1R3ZWVuLl9wdCA9IDA7XG4gICAgICAgIHAuaW5pdCh0YXJnZXQsIHVuaXQgPyB2YWx1ZSArIHVuaXQgOiB2YWx1ZSwgX3F1aWNrVHdlZW4sIDAsIFt0YXJnZXRdKTtcbiAgICAgICAgcC5yZW5kZXIoMSwgcCk7XG4gICAgICAgIF9xdWlja1R3ZWVuLl9wdCAmJiBfcmVuZGVyUHJvcFR3ZWVucygxLCBfcXVpY2tUd2Vlbik7XG4gICAgICB9IDogY2FjaGUuc2V0KHRhcmdldCwgcCk7XG5cbiAgICAgIHJldHVybiBQbHVnaW4gPyBzZXR0ZXIgOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHNldHRlcih0YXJnZXQsIHAsIHVuaXQgPyB2YWx1ZSArIHVuaXQgOiB2YWx1ZSwgY2FjaGUsIDEpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGlzVHdlZW5pbmc6IGZ1bmN0aW9uIGlzVHdlZW5pbmcodGFyZ2V0cykge1xuICAgICAgcmV0dXJuIF9nbG9iYWxUaW1lbGluZS5nZXRUd2VlbnNPZih0YXJnZXRzLCB0cnVlKS5sZW5ndGggPiAwO1xuICAgIH0sXG4gICAgZGVmYXVsdHM6IGZ1bmN0aW9uIGRlZmF1bHRzKHZhbHVlKSB7XG4gICAgICB2YWx1ZSAmJiB2YWx1ZS5lYXNlICYmICh2YWx1ZS5lYXNlID0gX3BhcnNlRWFzZSh2YWx1ZS5lYXNlLCBfZGVmYXVsdHMuZWFzZSkpO1xuICAgICAgcmV0dXJuIF9tZXJnZURlZXAoX2RlZmF1bHRzLCB2YWx1ZSB8fCB7fSk7XG4gICAgfSxcbiAgICBjb25maWc6IGZ1bmN0aW9uIGNvbmZpZyh2YWx1ZSkge1xuICAgICAgcmV0dXJuIF9tZXJnZURlZXAoX2NvbmZpZywgdmFsdWUgfHwge30pO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJFZmZlY3Q6IGZ1bmN0aW9uIHJlZ2lzdGVyRWZmZWN0KF9yZWYzKSB7XG4gICAgICB2YXIgbmFtZSA9IF9yZWYzLm5hbWUsXG4gICAgICAgICAgZWZmZWN0ID0gX3JlZjMuZWZmZWN0LFxuICAgICAgICAgIHBsdWdpbnMgPSBfcmVmMy5wbHVnaW5zLFxuICAgICAgICAgIGRlZmF1bHRzID0gX3JlZjMuZGVmYXVsdHMsXG4gICAgICAgICAgZXh0ZW5kVGltZWxpbmUgPSBfcmVmMy5leHRlbmRUaW1lbGluZTtcbiAgICAgIChwbHVnaW5zIHx8IFwiXCIpLnNwbGl0KFwiLFwiKS5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW5OYW1lKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW5OYW1lICYmICFfcGx1Z2luc1twbHVnaW5OYW1lXSAmJiAhX2dsb2JhbHNbcGx1Z2luTmFtZV0gJiYgX3dhcm4obmFtZSArIFwiIGVmZmVjdCByZXF1aXJlcyBcIiArIHBsdWdpbk5hbWUgKyBcIiBwbHVnaW4uXCIpO1xuICAgICAgfSk7XG5cbiAgICAgIF9lZmZlY3RzW25hbWVdID0gZnVuY3Rpb24gKHRhcmdldHMsIHZhcnMsIHRsKSB7XG4gICAgICAgIHJldHVybiBlZmZlY3QodG9BcnJheSh0YXJnZXRzKSwgX3NldERlZmF1bHRzKHZhcnMgfHwge30sIGRlZmF1bHRzKSwgdGwpO1xuICAgICAgfTtcblxuICAgICAgaWYgKGV4dGVuZFRpbWVsaW5lKSB7XG4gICAgICAgIFRpbWVsaW5lLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICh0YXJnZXRzLCB2YXJzLCBwb3NpdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZChfZWZmZWN0c1tuYW1lXSh0YXJnZXRzLCBfaXNPYmplY3QodmFycykgPyB2YXJzIDogKHBvc2l0aW9uID0gdmFycykgJiYge30sIHRoaXMpLCBwb3NpdGlvbik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlckVhc2U6IGZ1bmN0aW9uIHJlZ2lzdGVyRWFzZShuYW1lLCBlYXNlKSB7XG4gICAgICBfZWFzZU1hcFtuYW1lXSA9IF9wYXJzZUVhc2UoZWFzZSk7XG4gICAgfSxcbiAgICBwYXJzZUVhc2U6IGZ1bmN0aW9uIHBhcnNlRWFzZShlYXNlLCBkZWZhdWx0RWFzZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBfcGFyc2VFYXNlKGVhc2UsIGRlZmF1bHRFYXNlKSA6IF9lYXNlTWFwO1xuICAgIH0sXG4gICAgZ2V0QnlJZDogZnVuY3Rpb24gZ2V0QnlJZChpZCkge1xuICAgICAgcmV0dXJuIF9nbG9iYWxUaW1lbGluZS5nZXRCeUlkKGlkKTtcbiAgICB9LFxuICAgIGV4cG9ydFJvb3Q6IGZ1bmN0aW9uIGV4cG9ydFJvb3QodmFycywgaW5jbHVkZURlbGF5ZWRDYWxscykge1xuICAgICAgaWYgKHZhcnMgPT09IHZvaWQgMCkge1xuICAgICAgICB2YXJzID0ge307XG4gICAgICB9XG5cbiAgICAgIHZhciB0bCA9IG5ldyBUaW1lbGluZSh2YXJzKSxcbiAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICBuZXh0O1xuICAgICAgdGwuc21vb3RoQ2hpbGRUaW1pbmcgPSBfaXNOb3RGYWxzZSh2YXJzLnNtb290aENoaWxkVGltaW5nKTtcblxuICAgICAgX2dsb2JhbFRpbWVsaW5lLnJlbW92ZSh0bCk7XG5cbiAgICAgIHRsLl9kcCA9IDA7XG4gICAgICB0bC5fdGltZSA9IHRsLl90VGltZSA9IF9nbG9iYWxUaW1lbGluZS5fdGltZTtcbiAgICAgIGNoaWxkID0gX2dsb2JhbFRpbWVsaW5lLl9maXJzdDtcblxuICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgIG5leHQgPSBjaGlsZC5fbmV4dDtcblxuICAgICAgICBpZiAoaW5jbHVkZURlbGF5ZWRDYWxscyB8fCAhKCFjaGlsZC5fZHVyICYmIGNoaWxkIGluc3RhbmNlb2YgVHdlZW4gJiYgY2hpbGQudmFycy5vbkNvbXBsZXRlID09PSBjaGlsZC5fdGFyZ2V0c1swXSkpIHtcbiAgICAgICAgICBfYWRkVG9UaW1lbGluZSh0bCwgY2hpbGQsIGNoaWxkLl9zdGFydCAtIGNoaWxkLl9kZWxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IG5leHQ7XG4gICAgICB9XG5cbiAgICAgIF9hZGRUb1RpbWVsaW5lKF9nbG9iYWxUaW1lbGluZSwgdGwsIDApO1xuXG4gICAgICByZXR1cm4gdGw7XG4gICAgfSxcbiAgICB1dGlsczoge1xuICAgICAgd3JhcDogd3JhcCxcbiAgICAgIHdyYXBZb3lvOiB3cmFwWW95byxcbiAgICAgIGRpc3RyaWJ1dGU6IGRpc3RyaWJ1dGUsXG4gICAgICByYW5kb206IHJhbmRvbSxcbiAgICAgIHNuYXA6IHNuYXAsXG4gICAgICBub3JtYWxpemU6IG5vcm1hbGl6ZSxcbiAgICAgIGdldFVuaXQ6IGdldFVuaXQsXG4gICAgICBjbGFtcDogY2xhbXAsXG4gICAgICBzcGxpdENvbG9yOiBzcGxpdENvbG9yLFxuICAgICAgdG9BcnJheTogdG9BcnJheSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIG1hcFJhbmdlOiBtYXBSYW5nZSxcbiAgICAgIHBpcGU6IHBpcGUsXG4gICAgICB1bml0aXplOiB1bml0aXplLFxuICAgICAgaW50ZXJwb2xhdGU6IGludGVycG9sYXRlLFxuICAgICAgc2h1ZmZsZTogc2h1ZmZsZVxuICAgIH0sXG4gICAgaW5zdGFsbDogX2luc3RhbGwsXG4gICAgZWZmZWN0czogX2VmZmVjdHMsXG4gICAgdGlja2VyOiBfdGlja2VyLFxuICAgIHVwZGF0ZVJvb3Q6IFRpbWVsaW5lLnVwZGF0ZVJvb3QsXG4gICAgcGx1Z2luczogX3BsdWdpbnMsXG4gICAgZ2xvYmFsVGltZWxpbmU6IF9nbG9iYWxUaW1lbGluZSxcbiAgICBjb3JlOiB7XG4gICAgICBQcm9wVHdlZW46IFByb3BUd2VlbixcbiAgICAgIGdsb2JhbHM6IF9hZGRHbG9iYWwsXG4gICAgICBUd2VlbjogVHdlZW4sXG4gICAgICBUaW1lbGluZTogVGltZWxpbmUsXG4gICAgICBBbmltYXRpb246IEFuaW1hdGlvbixcbiAgICAgIGdldENhY2hlOiBfZ2V0Q2FjaGUsXG4gICAgICBfcmVtb3ZlTGlua2VkTGlzdEl0ZW06IF9yZW1vdmVMaW5rZWRMaXN0SXRlbSxcbiAgICAgIHN1cHByZXNzT3ZlcndyaXRlczogZnVuY3Rpb24gc3VwcHJlc3NPdmVyd3JpdGVzKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfc3VwcHJlc3NPdmVyd3JpdGVzID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9mb3JFYWNoTmFtZShcInRvLGZyb20sZnJvbVRvLGRlbGF5ZWRDYWxsLHNldCxraWxsVHdlZW5zT2ZcIiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gX2dzYXBbbmFtZV0gPSBUd2VlbltuYW1lXTtcbiAgfSk7XG5cbiAgX3RpY2tlci5hZGQoVGltZWxpbmUudXBkYXRlUm9vdCk7XG5cbiAgX3F1aWNrVHdlZW4gPSBfZ3NhcC50byh7fSwge1xuICAgIGR1cmF0aW9uOiAwXG4gIH0pO1xuXG4gIHZhciBfZ2V0UGx1Z2luUHJvcFR3ZWVuID0gZnVuY3Rpb24gX2dldFBsdWdpblByb3BUd2VlbihwbHVnaW4sIHByb3ApIHtcbiAgICB2YXIgcHQgPSBwbHVnaW4uX3B0O1xuXG4gICAgd2hpbGUgKHB0ICYmIHB0LnAgIT09IHByb3AgJiYgcHQub3AgIT09IHByb3AgJiYgcHQuZnAgIT09IHByb3ApIHtcbiAgICAgIHB0ID0gcHQuX25leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB0O1xuICB9LFxuICAgICAgX2FkZE1vZGlmaWVycyA9IGZ1bmN0aW9uIF9hZGRNb2RpZmllcnModHdlZW4sIG1vZGlmaWVycykge1xuICAgIHZhciB0YXJnZXRzID0gdHdlZW4uX3RhcmdldHMsXG4gICAgICAgIHAsXG4gICAgICAgIGksXG4gICAgICAgIHB0O1xuXG4gICAgZm9yIChwIGluIG1vZGlmaWVycykge1xuICAgICAgaSA9IHRhcmdldHMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHB0ID0gdHdlZW4uX3B0TG9va3VwW2ldW3BdO1xuXG4gICAgICAgIGlmIChwdCAmJiAocHQgPSBwdC5kKSkge1xuICAgICAgICAgIGlmIChwdC5fcHQpIHtcbiAgICAgICAgICAgIHB0ID0gX2dldFBsdWdpblByb3BUd2VlbihwdCwgcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHQgJiYgcHQubW9kaWZpZXIgJiYgcHQubW9kaWZpZXIobW9kaWZpZXJzW3BdLCB0d2VlbiwgdGFyZ2V0c1tpXSwgcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfYnVpbGRNb2RpZmllclBsdWdpbiA9IGZ1bmN0aW9uIF9idWlsZE1vZGlmaWVyUGx1Z2luKG5hbWUsIG1vZGlmaWVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICByYXdWYXJzOiAxLFxuICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCh0YXJnZXQsIHZhcnMsIHR3ZWVuKSB7XG4gICAgICAgIHR3ZWVuLl9vbkluaXQgPSBmdW5jdGlvbiAodHdlZW4pIHtcbiAgICAgICAgICB2YXIgdGVtcCwgcDtcblxuICAgICAgICAgIGlmIChfaXNTdHJpbmcodmFycykpIHtcbiAgICAgICAgICAgIHRlbXAgPSB7fTtcblxuICAgICAgICAgICAgX2ZvckVhY2hOYW1lKHZhcnMsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wW25hbWVdID0gMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXJzID0gdGVtcDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHRlbXAgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChwIGluIHZhcnMpIHtcbiAgICAgICAgICAgICAgdGVtcFtwXSA9IG1vZGlmaWVyKHZhcnNbcF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXJzID0gdGVtcDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfYWRkTW9kaWZpZXJzKHR3ZWVuLCB2YXJzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHZhciBnc2FwID0gX2dzYXAucmVnaXN0ZXJQbHVnaW4oe1xuICAgIG5hbWU6IFwiYXR0clwiLFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQodGFyZ2V0LCB2YXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldHMpIHtcbiAgICAgIHZhciBwLCBwdDtcblxuICAgICAgZm9yIChwIGluIHZhcnMpIHtcbiAgICAgICAgcHQgPSB0aGlzLmFkZCh0YXJnZXQsIFwic2V0QXR0cmlidXRlXCIsICh0YXJnZXQuZ2V0QXR0cmlidXRlKHApIHx8IDApICsgXCJcIiwgdmFyc1twXSwgaW5kZXgsIHRhcmdldHMsIDAsIDAsIHApO1xuICAgICAgICBwdCAmJiAocHQub3AgPSBwKTtcblxuICAgICAgICB0aGlzLl9wcm9wcy5wdXNoKHApO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIG5hbWU6IFwiZW5kQXJyYXlcIixcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHRhcmdldCwgdmFsdWUpIHtcbiAgICAgIHZhciBpID0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHRoaXMuYWRkKHRhcmdldCwgaSwgdGFyZ2V0W2ldIHx8IDAsIHZhbHVlW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIF9idWlsZE1vZGlmaWVyUGx1Z2luKFwicm91bmRQcm9wc1wiLCBfcm91bmRNb2RpZmllciksIF9idWlsZE1vZGlmaWVyUGx1Z2luKFwibW9kaWZpZXJzXCIpLCBfYnVpbGRNb2RpZmllclBsdWdpbihcInNuYXBcIiwgc25hcCkpIHx8IF9nc2FwO1xuICBUd2Vlbi52ZXJzaW9uID0gVGltZWxpbmUudmVyc2lvbiA9IGdzYXAudmVyc2lvbiA9IFwiMy45LjFcIjtcbiAgX2NvcmVSZWFkeSA9IDE7XG4gIF93aW5kb3dFeGlzdHMoKSAmJiBfd2FrZSgpO1xuICB2YXIgUG93ZXIwID0gX2Vhc2VNYXAuUG93ZXIwLFxuICAgICAgUG93ZXIxID0gX2Vhc2VNYXAuUG93ZXIxLFxuICAgICAgUG93ZXIyID0gX2Vhc2VNYXAuUG93ZXIyLFxuICAgICAgUG93ZXIzID0gX2Vhc2VNYXAuUG93ZXIzLFxuICAgICAgUG93ZXI0ID0gX2Vhc2VNYXAuUG93ZXI0LFxuICAgICAgTGluZWFyID0gX2Vhc2VNYXAuTGluZWFyLFxuICAgICAgUXVhZCA9IF9lYXNlTWFwLlF1YWQsXG4gICAgICBDdWJpYyA9IF9lYXNlTWFwLkN1YmljLFxuICAgICAgUXVhcnQgPSBfZWFzZU1hcC5RdWFydCxcbiAgICAgIFF1aW50ID0gX2Vhc2VNYXAuUXVpbnQsXG4gICAgICBTdHJvbmcgPSBfZWFzZU1hcC5TdHJvbmcsXG4gICAgICBFbGFzdGljID0gX2Vhc2VNYXAuRWxhc3RpYyxcbiAgICAgIEJhY2sgPSBfZWFzZU1hcC5CYWNrLFxuICAgICAgU3RlcHBlZEVhc2UgPSBfZWFzZU1hcC5TdGVwcGVkRWFzZSxcbiAgICAgIEJvdW5jZSA9IF9lYXNlTWFwLkJvdW5jZSxcbiAgICAgIFNpbmUgPSBfZWFzZU1hcC5TaW5lLFxuICAgICAgRXhwbyA9IF9lYXNlTWFwLkV4cG8sXG4gICAgICBDaXJjID0gX2Vhc2VNYXAuQ2lyYztcblxuICB2YXIgX3dpbiQxLFxuICAgICAgX2RvYyQxLFxuICAgICAgX2RvY0VsZW1lbnQsXG4gICAgICBfcGx1Z2luSW5pdHRlZCxcbiAgICAgIF90ZW1wRGl2LFxuICAgICAgX3RlbXBEaXZTdHlsZXIsXG4gICAgICBfcmVjZW50U2V0dGVyUGx1Z2luLFxuICAgICAgX3dpbmRvd0V4aXN0cyQxID0gZnVuY3Rpb24gX3dpbmRvd0V4aXN0cygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgfSxcbiAgICAgIF90cmFuc2Zvcm1Qcm9wcyA9IHt9LFxuICAgICAgX1JBRDJERUcgPSAxODAgLyBNYXRoLlBJLFxuICAgICAgX0RFRzJSQUQgPSBNYXRoLlBJIC8gMTgwLFxuICAgICAgX2F0YW4yID0gTWF0aC5hdGFuMixcbiAgICAgIF9iaWdOdW0kMSA9IDFlOCxcbiAgICAgIF9jYXBzRXhwID0gLyhbQS1aXSkvZyxcbiAgICAgIF9ob3Jpem9udGFsRXhwID0gLyg/OmxlZnR8cmlnaHR8d2lkdGh8bWFyZ2lufHBhZGRpbmd8eCkvaSxcbiAgICAgIF9jb21wbGV4RXhwID0gL1tcXHMsXFwoXVxcUy8sXG4gICAgICBfcHJvcGVydHlBbGlhc2VzID0ge1xuICAgIGF1dG9BbHBoYTogXCJvcGFjaXR5LHZpc2liaWxpdHlcIixcbiAgICBzY2FsZTogXCJzY2FsZVgsc2NhbGVZXCIsXG4gICAgYWxwaGE6IFwib3BhY2l0eVwiXG4gIH0sXG4gICAgICBfcmVuZGVyQ1NTUHJvcCA9IGZ1bmN0aW9uIF9yZW5kZXJDU1NQcm9wKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCBNYXRoLnJvdW5kKChkYXRhLnMgKyBkYXRhLmMgKiByYXRpbykgKiAxMDAwMCkgLyAxMDAwMCArIGRhdGEudSwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyUHJvcFdpdGhFbmQgPSBmdW5jdGlvbiBfcmVuZGVyUHJvcFdpdGhFbmQocmF0aW8sIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsIHJhdGlvID09PSAxID8gZGF0YS5lIDogTWF0aC5yb3VuZCgoZGF0YS5zICsgZGF0YS5jICogcmF0aW8pICogMTAwMDApIC8gMTAwMDAgKyBkYXRhLnUsIGRhdGEpO1xuICB9LFxuICAgICAgX3JlbmRlckNTU1Byb3BXaXRoQmVnaW5uaW5nID0gZnVuY3Rpb24gX3JlbmRlckNTU1Byb3BXaXRoQmVnaW5uaW5nKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCByYXRpbyA/IE1hdGgucm91bmQoKGRhdGEucyArIGRhdGEuYyAqIHJhdGlvKSAqIDEwMDAwKSAvIDEwMDAwICsgZGF0YS51IDogZGF0YS5iLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJSb3VuZGVkQ1NTUHJvcCA9IGZ1bmN0aW9uIF9yZW5kZXJSb3VuZGVkQ1NTUHJvcChyYXRpbywgZGF0YSkge1xuICAgIHZhciB2YWx1ZSA9IGRhdGEucyArIGRhdGEuYyAqIHJhdGlvO1xuICAgIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCB+fih2YWx1ZSArICh2YWx1ZSA8IDAgPyAtLjUgOiAuNSkpICsgZGF0YS51LCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlID0gZnVuY3Rpb24gX3JlbmRlck5vblR3ZWVuaW5nVmFsdWUocmF0aW8sIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsIHJhdGlvID8gZGF0YS5lIDogZGF0YS5iLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlT25seUF0RW5kID0gZnVuY3Rpb24gX3JlbmRlck5vblR3ZWVuaW5nVmFsdWVPbmx5QXRFbmQocmF0aW8sIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsIHJhdGlvICE9PSAxID8gZGF0YS5iIDogZGF0YS5lLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9zZXR0ZXJDU1NTdHlsZSA9IGZ1bmN0aW9uIF9zZXR0ZXJDU1NTdHlsZSh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXQuc3R5bGVbcHJvcGVydHldID0gdmFsdWU7XG4gIH0sXG4gICAgICBfc2V0dGVyQ1NTUHJvcCA9IGZ1bmN0aW9uIF9zZXR0ZXJDU1NQcm9wKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICB9LFxuICAgICAgX3NldHRlclRyYW5zZm9ybSA9IGZ1bmN0aW9uIF9zZXR0ZXJUcmFuc2Zvcm0odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGFyZ2V0Ll9nc2FwW3Byb3BlcnR5XSA9IHZhbHVlO1xuICB9LFxuICAgICAgX3NldHRlclNjYWxlID0gZnVuY3Rpb24gX3NldHRlclNjYWxlKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldC5fZ3NhcC5zY2FsZVggPSB0YXJnZXQuX2dzYXAuc2NhbGVZID0gdmFsdWU7XG4gIH0sXG4gICAgICBfc2V0dGVyU2NhbGVXaXRoUmVuZGVyID0gZnVuY3Rpb24gX3NldHRlclNjYWxlV2l0aFJlbmRlcih0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgZGF0YSwgcmF0aW8pIHtcbiAgICB2YXIgY2FjaGUgPSB0YXJnZXQuX2dzYXA7XG4gICAgY2FjaGUuc2NhbGVYID0gY2FjaGUuc2NhbGVZID0gdmFsdWU7XG4gICAgY2FjaGUucmVuZGVyVHJhbnNmb3JtKHJhdGlvLCBjYWNoZSk7XG4gIH0sXG4gICAgICBfc2V0dGVyVHJhbnNmb3JtV2l0aFJlbmRlciA9IGZ1bmN0aW9uIF9zZXR0ZXJUcmFuc2Zvcm1XaXRoUmVuZGVyKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCBkYXRhLCByYXRpbykge1xuICAgIHZhciBjYWNoZSA9IHRhcmdldC5fZ3NhcDtcbiAgICBjYWNoZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBjYWNoZS5yZW5kZXJUcmFuc2Zvcm0ocmF0aW8sIGNhY2hlKTtcbiAgfSxcbiAgICAgIF90cmFuc2Zvcm1Qcm9wID0gXCJ0cmFuc2Zvcm1cIixcbiAgICAgIF90cmFuc2Zvcm1PcmlnaW5Qcm9wID0gX3RyYW5zZm9ybVByb3AgKyBcIk9yaWdpblwiLFxuICAgICAgX3N1cHBvcnRzM0QsXG4gICAgICBfY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIF9jcmVhdGVFbGVtZW50KHR5cGUsIG5zKSB7XG4gICAgdmFyIGUgPSBfZG9jJDEuY3JlYXRlRWxlbWVudE5TID8gX2RvYyQxLmNyZWF0ZUVsZW1lbnROUygobnMgfHwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpLnJlcGxhY2UoL15odHRwcy8sIFwiaHR0cFwiKSwgdHlwZSkgOiBfZG9jJDEuY3JlYXRlRWxlbWVudCh0eXBlKTtcbiAgICByZXR1cm4gZS5zdHlsZSA/IGUgOiBfZG9jJDEuY3JlYXRlRWxlbWVudCh0eXBlKTtcbiAgfSxcbiAgICAgIF9nZXRDb21wdXRlZFByb3BlcnR5ID0gZnVuY3Rpb24gX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwgc2tpcFByZWZpeEZhbGxiYWNrKSB7XG4gICAgdmFyIGNzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpO1xuICAgIHJldHVybiBjc1twcm9wZXJ0eV0gfHwgY3MuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eS5yZXBsYWNlKF9jYXBzRXhwLCBcIi0kMVwiKS50b0xvd2VyQ2FzZSgpKSB8fCBjcy5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KSB8fCAhc2tpcFByZWZpeEZhbGxiYWNrICYmIF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgX2NoZWNrUHJvcFByZWZpeChwcm9wZXJ0eSkgfHwgcHJvcGVydHksIDEpIHx8IFwiXCI7XG4gIH0sXG4gICAgICBfcHJlZml4ZXMgPSBcIk8sTW96LG1zLE1zLFdlYmtpdFwiLnNwbGl0KFwiLFwiKSxcbiAgICAgIF9jaGVja1Byb3BQcmVmaXggPSBmdW5jdGlvbiBfY2hlY2tQcm9wUHJlZml4KHByb3BlcnR5LCBlbGVtZW50LCBwcmVmZXJQcmVmaXgpIHtcbiAgICB2YXIgZSA9IGVsZW1lbnQgfHwgX3RlbXBEaXYsXG4gICAgICAgIHMgPSBlLnN0eWxlLFxuICAgICAgICBpID0gNTtcblxuICAgIGlmIChwcm9wZXJ0eSBpbiBzICYmICFwcmVmZXJQcmVmaXgpIHtcbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcGVydHkuc3Vic3RyKDEpO1xuXG4gICAgd2hpbGUgKGktLSAmJiAhKF9wcmVmaXhlc1tpXSArIHByb3BlcnR5IGluIHMpKSB7fVxuXG4gICAgcmV0dXJuIGkgPCAwID8gbnVsbCA6IChpID09PSAzID8gXCJtc1wiIDogaSA+PSAwID8gX3ByZWZpeGVzW2ldIDogXCJcIikgKyBwcm9wZXJ0eTtcbiAgfSxcbiAgICAgIF9pbml0Q29yZSA9IGZ1bmN0aW9uIF9pbml0Q29yZSgpIHtcbiAgICBpZiAoX3dpbmRvd0V4aXN0cyQxKCkgJiYgd2luZG93LmRvY3VtZW50KSB7XG4gICAgICBfd2luJDEgPSB3aW5kb3c7XG4gICAgICBfZG9jJDEgPSBfd2luJDEuZG9jdW1lbnQ7XG4gICAgICBfZG9jRWxlbWVudCA9IF9kb2MkMS5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBfdGVtcERpdiA9IF9jcmVhdGVFbGVtZW50KFwiZGl2XCIpIHx8IHtcbiAgICAgICAgc3R5bGU6IHt9XG4gICAgICB9O1xuICAgICAgX3RlbXBEaXZTdHlsZXIgPSBfY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIF90cmFuc2Zvcm1Qcm9wID0gX2NoZWNrUHJvcFByZWZpeChfdHJhbnNmb3JtUHJvcCk7XG4gICAgICBfdHJhbnNmb3JtT3JpZ2luUHJvcCA9IF90cmFuc2Zvcm1Qcm9wICsgXCJPcmlnaW5cIjtcbiAgICAgIF90ZW1wRGl2LnN0eWxlLmNzc1RleHQgPSBcImJvcmRlci13aWR0aDowO2xpbmUtaGVpZ2h0OjA7cG9zaXRpb246YWJzb2x1dGU7cGFkZGluZzowXCI7XG4gICAgICBfc3VwcG9ydHMzRCA9ICEhX2NoZWNrUHJvcFByZWZpeChcInBlcnNwZWN0aXZlXCIpO1xuICAgICAgX3BsdWdpbkluaXR0ZWQgPSAxO1xuICAgIH1cbiAgfSxcbiAgICAgIF9nZXRCQm94SGFjayA9IGZ1bmN0aW9uIF9nZXRCQm94SGFjayhzd2FwSWZQb3NzaWJsZSkge1xuICAgIHZhciBzdmcgPSBfY3JlYXRlRWxlbWVudChcInN2Z1wiLCB0aGlzLm93bmVyU1ZHRWxlbWVudCAmJiB0aGlzLm93bmVyU1ZHRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ4bWxuc1wiKSB8fCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpLFxuICAgICAgICBvbGRQYXJlbnQgPSB0aGlzLnBhcmVudE5vZGUsXG4gICAgICAgIG9sZFNpYmxpbmcgPSB0aGlzLm5leHRTaWJsaW5nLFxuICAgICAgICBvbGRDU1MgPSB0aGlzLnN0eWxlLmNzc1RleHQsXG4gICAgICAgIGJib3g7XG5cbiAgICBfZG9jRWxlbWVudC5hcHBlbmRDaGlsZChzdmcpO1xuXG4gICAgc3ZnLmFwcGVuZENoaWxkKHRoaXMpO1xuICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblxuICAgIGlmIChzd2FwSWZQb3NzaWJsZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYmJveCA9IHRoaXMuZ2V0QkJveCgpO1xuICAgICAgICB0aGlzLl9nc2FwQkJveCA9IHRoaXMuZ2V0QkJveDtcbiAgICAgICAgdGhpcy5nZXRCQm94ID0gX2dldEJCb3hIYWNrO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2dzYXBCQm94KSB7XG4gICAgICBiYm94ID0gdGhpcy5fZ3NhcEJCb3goKTtcbiAgICB9XG5cbiAgICBpZiAob2xkUGFyZW50KSB7XG4gICAgICBpZiAob2xkU2libGluZykge1xuICAgICAgICBvbGRQYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMsIG9sZFNpYmxpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkUGFyZW50LmFwcGVuZENoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9kb2NFbGVtZW50LnJlbW92ZUNoaWxkKHN2Zyk7XG5cbiAgICB0aGlzLnN0eWxlLmNzc1RleHQgPSBvbGRDU1M7XG4gICAgcmV0dXJuIGJib3g7XG4gIH0sXG4gICAgICBfZ2V0QXR0cmlidXRlRmFsbGJhY2tzID0gZnVuY3Rpb24gX2dldEF0dHJpYnV0ZUZhbGxiYWNrcyh0YXJnZXQsIGF0dHJpYnV0ZXNBcnJheSkge1xuICAgIHZhciBpID0gYXR0cmlidXRlc0FycmF5Lmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmICh0YXJnZXQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZXNBcnJheVtpXSkpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlc0FycmF5W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfZ2V0QkJveCA9IGZ1bmN0aW9uIF9nZXRCQm94KHRhcmdldCkge1xuICAgIHZhciBib3VuZHM7XG5cbiAgICB0cnkge1xuICAgICAgYm91bmRzID0gdGFyZ2V0LmdldEJCb3goKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYm91bmRzID0gX2dldEJCb3hIYWNrLmNhbGwodGFyZ2V0LCB0cnVlKTtcbiAgICB9XG5cbiAgICBib3VuZHMgJiYgKGJvdW5kcy53aWR0aCB8fCBib3VuZHMuaGVpZ2h0KSB8fCB0YXJnZXQuZ2V0QkJveCA9PT0gX2dldEJCb3hIYWNrIHx8IChib3VuZHMgPSBfZ2V0QkJveEhhY2suY2FsbCh0YXJnZXQsIHRydWUpKTtcbiAgICByZXR1cm4gYm91bmRzICYmICFib3VuZHMud2lkdGggJiYgIWJvdW5kcy54ICYmICFib3VuZHMueSA/IHtcbiAgICAgIHg6ICtfZ2V0QXR0cmlidXRlRmFsbGJhY2tzKHRhcmdldCwgW1wieFwiLCBcImN4XCIsIFwieDFcIl0pIHx8IDAsXG4gICAgICB5OiArX2dldEF0dHJpYnV0ZUZhbGxiYWNrcyh0YXJnZXQsIFtcInlcIiwgXCJjeVwiLCBcInkxXCJdKSB8fCAwLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9IDogYm91bmRzO1xuICB9LFxuICAgICAgX2lzU1ZHID0gZnVuY3Rpb24gX2lzU1ZHKGUpIHtcbiAgICByZXR1cm4gISEoZS5nZXRDVE0gJiYgKCFlLnBhcmVudE5vZGUgfHwgZS5vd25lclNWR0VsZW1lbnQpICYmIF9nZXRCQm94KGUpKTtcbiAgfSxcbiAgICAgIF9yZW1vdmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIF9yZW1vdmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5KSB7XG4gICAgaWYgKHByb3BlcnR5KSB7XG4gICAgICB2YXIgc3R5bGUgPSB0YXJnZXQuc3R5bGU7XG5cbiAgICAgIGlmIChwcm9wZXJ0eSBpbiBfdHJhbnNmb3JtUHJvcHMgJiYgcHJvcGVydHkgIT09IF90cmFuc2Zvcm1PcmlnaW5Qcm9wKSB7XG4gICAgICAgIHByb3BlcnR5ID0gX3RyYW5zZm9ybVByb3A7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdHlsZS5yZW1vdmVQcm9wZXJ0eSkge1xuICAgICAgICBpZiAocHJvcGVydHkuc3Vic3RyKDAsIDIpID09PSBcIm1zXCIgfHwgcHJvcGVydHkuc3Vic3RyKDAsIDYpID09PSBcIndlYmtpdFwiKSB7XG4gICAgICAgICAgcHJvcGVydHkgPSBcIi1cIiArIHByb3BlcnR5O1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkocHJvcGVydHkucmVwbGFjZShfY2Fwc0V4cCwgXCItJDFcIikudG9Mb3dlckNhc2UoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgICAgIF9hZGROb25Ud2VlbmluZ1BUID0gZnVuY3Rpb24gX2FkZE5vblR3ZWVuaW5nUFQocGx1Z2luLCB0YXJnZXQsIHByb3BlcnR5LCBiZWdpbm5pbmcsIGVuZCwgb25seVNldEF0RW5kKSB7XG4gICAgdmFyIHB0ID0gbmV3IFByb3BUd2VlbihwbHVnaW4uX3B0LCB0YXJnZXQsIHByb3BlcnR5LCAwLCAxLCBvbmx5U2V0QXRFbmQgPyBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZU9ubHlBdEVuZCA6IF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlKTtcbiAgICBwbHVnaW4uX3B0ID0gcHQ7XG4gICAgcHQuYiA9IGJlZ2lubmluZztcbiAgICBwdC5lID0gZW5kO1xuXG4gICAgcGx1Z2luLl9wcm9wcy5wdXNoKHByb3BlcnR5KTtcblxuICAgIHJldHVybiBwdDtcbiAgfSxcbiAgICAgIF9ub25Db252ZXJ0aWJsZVVuaXRzID0ge1xuICAgIGRlZzogMSxcbiAgICByYWQ6IDEsXG4gICAgdHVybjogMVxuICB9LFxuICAgICAgX2NvbnZlcnRUb1VuaXQgPSBmdW5jdGlvbiBfY29udmVydFRvVW5pdCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgdW5pdCkge1xuICAgIHZhciBjdXJWYWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpIHx8IDAsXG4gICAgICAgIGN1clVuaXQgPSAodmFsdWUgKyBcIlwiKS50cmltKCkuc3Vic3RyKChjdXJWYWx1ZSArIFwiXCIpLmxlbmd0aCkgfHwgXCJweFwiLFxuICAgICAgICBzdHlsZSA9IF90ZW1wRGl2LnN0eWxlLFxuICAgICAgICBob3Jpem9udGFsID0gX2hvcml6b250YWxFeHAudGVzdChwcm9wZXJ0eSksXG4gICAgICAgIGlzUm9vdFNWRyA9IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic3ZnXCIsXG4gICAgICAgIG1lYXN1cmVQcm9wZXJ0eSA9IChpc1Jvb3RTVkcgPyBcImNsaWVudFwiIDogXCJvZmZzZXRcIikgKyAoaG9yaXpvbnRhbCA/IFwiV2lkdGhcIiA6IFwiSGVpZ2h0XCIpLFxuICAgICAgICBhbW91bnQgPSAxMDAsXG4gICAgICAgIHRvUGl4ZWxzID0gdW5pdCA9PT0gXCJweFwiLFxuICAgICAgICB0b1BlcmNlbnQgPSB1bml0ID09PSBcIiVcIixcbiAgICAgICAgcHgsXG4gICAgICAgIHBhcmVudCxcbiAgICAgICAgY2FjaGUsXG4gICAgICAgIGlzU1ZHO1xuXG4gICAgaWYgKHVuaXQgPT09IGN1clVuaXQgfHwgIWN1clZhbHVlIHx8IF9ub25Db252ZXJ0aWJsZVVuaXRzW3VuaXRdIHx8IF9ub25Db252ZXJ0aWJsZVVuaXRzW2N1clVuaXRdKSB7XG4gICAgICByZXR1cm4gY3VyVmFsdWU7XG4gICAgfVxuXG4gICAgY3VyVW5pdCAhPT0gXCJweFwiICYmICF0b1BpeGVscyAmJiAoY3VyVmFsdWUgPSBfY29udmVydFRvVW5pdCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgXCJweFwiKSk7XG4gICAgaXNTVkcgPSB0YXJnZXQuZ2V0Q1RNICYmIF9pc1NWRyh0YXJnZXQpO1xuXG4gICAgaWYgKCh0b1BlcmNlbnQgfHwgY3VyVW5pdCA9PT0gXCIlXCIpICYmIChfdHJhbnNmb3JtUHJvcHNbcHJvcGVydHldIHx8IH5wcm9wZXJ0eS5pbmRleE9mKFwiYWRpdXNcIikpKSB7XG4gICAgICBweCA9IGlzU1ZHID8gdGFyZ2V0LmdldEJCb3goKVtob3Jpem9udGFsID8gXCJ3aWR0aFwiIDogXCJoZWlnaHRcIl0gOiB0YXJnZXRbbWVhc3VyZVByb3BlcnR5XTtcbiAgICAgIHJldHVybiBfcm91bmQodG9QZXJjZW50ID8gY3VyVmFsdWUgLyBweCAqIGFtb3VudCA6IGN1clZhbHVlIC8gMTAwICogcHgpO1xuICAgIH1cblxuICAgIHN0eWxlW2hvcml6b250YWwgPyBcIndpZHRoXCIgOiBcImhlaWdodFwiXSA9IGFtb3VudCArICh0b1BpeGVscyA/IGN1clVuaXQgOiB1bml0KTtcbiAgICBwYXJlbnQgPSB+cHJvcGVydHkuaW5kZXhPZihcImFkaXVzXCIpIHx8IHVuaXQgPT09IFwiZW1cIiAmJiB0YXJnZXQuYXBwZW5kQ2hpbGQgJiYgIWlzUm9vdFNWRyA/IHRhcmdldCA6IHRhcmdldC5wYXJlbnROb2RlO1xuXG4gICAgaWYgKGlzU1ZHKSB7XG4gICAgICBwYXJlbnQgPSAodGFyZ2V0Lm93bmVyU1ZHRWxlbWVudCB8fCB7fSkucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICBpZiAoIXBhcmVudCB8fCBwYXJlbnQgPT09IF9kb2MkMSB8fCAhcGFyZW50LmFwcGVuZENoaWxkKSB7XG4gICAgICBwYXJlbnQgPSBfZG9jJDEuYm9keTtcbiAgICB9XG5cbiAgICBjYWNoZSA9IHBhcmVudC5fZ3NhcDtcblxuICAgIGlmIChjYWNoZSAmJiB0b1BlcmNlbnQgJiYgY2FjaGUud2lkdGggJiYgaG9yaXpvbnRhbCAmJiBjYWNoZS50aW1lID09PSBfdGlja2VyLnRpbWUpIHtcbiAgICAgIHJldHVybiBfcm91bmQoY3VyVmFsdWUgLyBjYWNoZS53aWR0aCAqIGFtb3VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0b1BlcmNlbnQgfHwgY3VyVW5pdCA9PT0gXCIlXCIpICYmIChzdHlsZS5wb3NpdGlvbiA9IF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgXCJwb3NpdGlvblwiKSk7XG4gICAgICBwYXJlbnQgPT09IHRhcmdldCAmJiAoc3R5bGUucG9zaXRpb24gPSBcInN0YXRpY1wiKTtcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChfdGVtcERpdik7XG4gICAgICBweCA9IF90ZW1wRGl2W21lYXN1cmVQcm9wZXJ0eV07XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX3RlbXBEaXYpO1xuICAgICAgc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cbiAgICAgIGlmIChob3Jpem9udGFsICYmIHRvUGVyY2VudCkge1xuICAgICAgICBjYWNoZSA9IF9nZXRDYWNoZShwYXJlbnQpO1xuICAgICAgICBjYWNoZS50aW1lID0gX3RpY2tlci50aW1lO1xuICAgICAgICBjYWNoZS53aWR0aCA9IHBhcmVudFttZWFzdXJlUHJvcGVydHldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfcm91bmQodG9QaXhlbHMgPyBweCAqIGN1clZhbHVlIC8gYW1vdW50IDogcHggJiYgY3VyVmFsdWUgPyBhbW91bnQgLyBweCAqIGN1clZhbHVlIDogMCk7XG4gIH0sXG4gICAgICBfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCB1bml0LCB1bmNhY2hlKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIF9wbHVnaW5Jbml0dGVkIHx8IF9pbml0Q29yZSgpO1xuXG4gICAgaWYgKHByb3BlcnR5IGluIF9wcm9wZXJ0eUFsaWFzZXMgJiYgcHJvcGVydHkgIT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgIHByb3BlcnR5ID0gX3Byb3BlcnR5QWxpYXNlc1twcm9wZXJ0eV07XG5cbiAgICAgIGlmICh+cHJvcGVydHkuaW5kZXhPZihcIixcIikpIHtcbiAgICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5zcGxpdChcIixcIilbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF90cmFuc2Zvcm1Qcm9wc1twcm9wZXJ0eV0gJiYgcHJvcGVydHkgIT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgIHZhbHVlID0gX3BhcnNlVHJhbnNmb3JtKHRhcmdldCwgdW5jYWNoZSk7XG4gICAgICB2YWx1ZSA9IHByb3BlcnR5ICE9PSBcInRyYW5zZm9ybU9yaWdpblwiID8gdmFsdWVbcHJvcGVydHldIDogdmFsdWUuc3ZnID8gdmFsdWUub3JpZ2luIDogX2ZpcnN0VHdvT25seShfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIF90cmFuc2Zvcm1PcmlnaW5Qcm9wKSkgKyBcIiBcIiArIHZhbHVlLnpPcmlnaW4gKyBcInB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LnN0eWxlW3Byb3BlcnR5XTtcblxuICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZSA9PT0gXCJhdXRvXCIgfHwgdW5jYWNoZSB8fCB+KHZhbHVlICsgXCJcIikuaW5kZXhPZihcImNhbGMoXCIpKSB7XG4gICAgICAgIHZhbHVlID0gX3NwZWNpYWxQcm9wc1twcm9wZXJ0eV0gJiYgX3NwZWNpYWxQcm9wc1twcm9wZXJ0eV0odGFyZ2V0LCBwcm9wZXJ0eSwgdW5pdCkgfHwgX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSkgfHwgX2dldFByb3BlcnR5KHRhcmdldCwgcHJvcGVydHkpIHx8IChwcm9wZXJ0eSA9PT0gXCJvcGFjaXR5XCIgPyAxIDogMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaXQgJiYgIX4odmFsdWUgKyBcIlwiKS50cmltKCkuaW5kZXhPZihcIiBcIikgPyBfY29udmVydFRvVW5pdCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgdW5pdCkgKyB1bml0IDogdmFsdWU7XG4gIH0sXG4gICAgICBfdHdlZW5Db21wbGV4Q1NTU3RyaW5nID0gZnVuY3Rpb24gX3R3ZWVuQ29tcGxleENTU1N0cmluZyh0YXJnZXQsIHByb3AsIHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoIXN0YXJ0IHx8IHN0YXJ0ID09PSBcIm5vbmVcIikge1xuICAgICAgdmFyIHAgPSBfY2hlY2tQcm9wUHJlZml4KHByb3AsIHRhcmdldCwgMSksXG4gICAgICAgICAgcyA9IHAgJiYgX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBwLCAxKTtcblxuICAgICAgaWYgKHMgJiYgcyAhPT0gc3RhcnQpIHtcbiAgICAgICAgcHJvcCA9IHA7XG4gICAgICAgIHN0YXJ0ID0gcztcbiAgICAgIH0gZWxzZSBpZiAocHJvcCA9PT0gXCJib3JkZXJDb2xvclwiKSB7XG4gICAgICAgIHN0YXJ0ID0gX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBcImJvcmRlclRvcENvbG9yXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwdCA9IG5ldyBQcm9wVHdlZW4odGhpcy5fcHQsIHRhcmdldC5zdHlsZSwgcHJvcCwgMCwgMSwgX3JlbmRlckNvbXBsZXhTdHJpbmcpLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIG1hdGNoSW5kZXggPSAwLFxuICAgICAgICBhLFxuICAgICAgICByZXN1bHQsXG4gICAgICAgIHN0YXJ0VmFsdWVzLFxuICAgICAgICBzdGFydE51bSxcbiAgICAgICAgY29sb3IsXG4gICAgICAgIHN0YXJ0VmFsdWUsXG4gICAgICAgIGVuZFZhbHVlLFxuICAgICAgICBlbmROdW0sXG4gICAgICAgIGNodW5rLFxuICAgICAgICBlbmRVbml0LFxuICAgICAgICBzdGFydFVuaXQsXG4gICAgICAgIHJlbGF0aXZlLFxuICAgICAgICBlbmRWYWx1ZXM7XG4gICAgcHQuYiA9IHN0YXJ0O1xuICAgIHB0LmUgPSBlbmQ7XG4gICAgc3RhcnQgKz0gXCJcIjtcbiAgICBlbmQgKz0gXCJcIjtcblxuICAgIGlmIChlbmQgPT09IFwiYXV0b1wiKSB7XG4gICAgICB0YXJnZXQuc3R5bGVbcHJvcF0gPSBlbmQ7XG4gICAgICBlbmQgPSBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHx8IGVuZDtcbiAgICAgIHRhcmdldC5zdHlsZVtwcm9wXSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIGEgPSBbc3RhcnQsIGVuZF07XG5cbiAgICBfY29sb3JTdHJpbmdGaWx0ZXIoYSk7XG5cbiAgICBzdGFydCA9IGFbMF07XG4gICAgZW5kID0gYVsxXTtcbiAgICBzdGFydFZhbHVlcyA9IHN0YXJ0Lm1hdGNoKF9udW1XaXRoVW5pdEV4cCkgfHwgW107XG4gICAgZW5kVmFsdWVzID0gZW5kLm1hdGNoKF9udW1XaXRoVW5pdEV4cCkgfHwgW107XG5cbiAgICBpZiAoZW5kVmFsdWVzLmxlbmd0aCkge1xuICAgICAgd2hpbGUgKHJlc3VsdCA9IF9udW1XaXRoVW5pdEV4cC5leGVjKGVuZCkpIHtcbiAgICAgICAgZW5kVmFsdWUgPSByZXN1bHRbMF07XG4gICAgICAgIGNodW5rID0gZW5kLnN1YnN0cmluZyhpbmRleCwgcmVzdWx0LmluZGV4KTtcblxuICAgICAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgICBjb2xvciA9IChjb2xvciArIDEpICUgNTtcbiAgICAgICAgfSBlbHNlIGlmIChjaHVuay5zdWJzdHIoLTUpID09PSBcInJnYmEoXCIgfHwgY2h1bmsuc3Vic3RyKC01KSA9PT0gXCJoc2xhKFwiKSB7XG4gICAgICAgICAgY29sb3IgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZFZhbHVlICE9PSAoc3RhcnRWYWx1ZSA9IHN0YXJ0VmFsdWVzW21hdGNoSW5kZXgrK10gfHwgXCJcIikpIHtcbiAgICAgICAgICBzdGFydE51bSA9IHBhcnNlRmxvYXQoc3RhcnRWYWx1ZSkgfHwgMDtcbiAgICAgICAgICBzdGFydFVuaXQgPSBzdGFydFZhbHVlLnN1YnN0cigoc3RhcnROdW0gKyBcIlwiKS5sZW5ndGgpO1xuICAgICAgICAgIHJlbGF0aXZlID0gZW5kVmFsdWUuY2hhckF0KDEpID09PSBcIj1cIiA/ICsoZW5kVmFsdWUuY2hhckF0KDApICsgXCIxXCIpIDogMDtcblxuICAgICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgZW5kVmFsdWUgPSBlbmRWYWx1ZS5zdWJzdHIoMik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZW5kTnVtID0gcGFyc2VGbG9hdChlbmRWYWx1ZSk7XG4gICAgICAgICAgZW5kVW5pdCA9IGVuZFZhbHVlLnN1YnN0cigoZW5kTnVtICsgXCJcIikubGVuZ3RoKTtcbiAgICAgICAgICBpbmRleCA9IF9udW1XaXRoVW5pdEV4cC5sYXN0SW5kZXggLSBlbmRVbml0Lmxlbmd0aDtcblxuICAgICAgICAgIGlmICghZW5kVW5pdCkge1xuICAgICAgICAgICAgZW5kVW5pdCA9IGVuZFVuaXQgfHwgX2NvbmZpZy51bml0c1twcm9wXSB8fCBzdGFydFVuaXQ7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gZW5kLmxlbmd0aCkge1xuICAgICAgICAgICAgICBlbmQgKz0gZW5kVW5pdDtcbiAgICAgICAgICAgICAgcHQuZSArPSBlbmRVbml0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdGFydFVuaXQgIT09IGVuZFVuaXQpIHtcbiAgICAgICAgICAgIHN0YXJ0TnVtID0gX2NvbnZlcnRUb1VuaXQodGFyZ2V0LCBwcm9wLCBzdGFydFZhbHVlLCBlbmRVbml0KSB8fCAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHB0Ll9wdCA9IHtcbiAgICAgICAgICAgIF9uZXh0OiBwdC5fcHQsXG4gICAgICAgICAgICBwOiBjaHVuayB8fCBtYXRjaEluZGV4ID09PSAxID8gY2h1bmsgOiBcIixcIixcbiAgICAgICAgICAgIHM6IHN0YXJ0TnVtLFxuICAgICAgICAgICAgYzogcmVsYXRpdmUgPyByZWxhdGl2ZSAqIGVuZE51bSA6IGVuZE51bSAtIHN0YXJ0TnVtLFxuICAgICAgICAgICAgbTogY29sb3IgJiYgY29sb3IgPCA0IHx8IHByb3AgPT09IFwiekluZGV4XCIgPyBNYXRoLnJvdW5kIDogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHQuYyA9IGluZGV4IDwgZW5kLmxlbmd0aCA/IGVuZC5zdWJzdHJpbmcoaW5kZXgsIGVuZC5sZW5ndGgpIDogXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcHQuciA9IHByb3AgPT09IFwiZGlzcGxheVwiICYmIGVuZCA9PT0gXCJub25lXCIgPyBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZU9ubHlBdEVuZCA6IF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlO1xuICAgIH1cblxuICAgIF9yZWxFeHAudGVzdChlbmQpICYmIChwdC5lID0gMCk7XG4gICAgdGhpcy5fcHQgPSBwdDtcbiAgICByZXR1cm4gcHQ7XG4gIH0sXG4gICAgICBfa2V5d29yZFRvUGVyY2VudCA9IHtcbiAgICB0b3A6IFwiMCVcIixcbiAgICBib3R0b206IFwiMTAwJVwiLFxuICAgIGxlZnQ6IFwiMCVcIixcbiAgICByaWdodDogXCIxMDAlXCIsXG4gICAgY2VudGVyOiBcIjUwJVwiXG4gIH0sXG4gICAgICBfY29udmVydEtleXdvcmRzVG9QZXJjZW50YWdlcyA9IGZ1bmN0aW9uIF9jb252ZXJ0S2V5d29yZHNUb1BlcmNlbnRhZ2VzKHZhbHVlKSB7XG4gICAgdmFyIHNwbGl0ID0gdmFsdWUuc3BsaXQoXCIgXCIpLFxuICAgICAgICB4ID0gc3BsaXRbMF0sXG4gICAgICAgIHkgPSBzcGxpdFsxXSB8fCBcIjUwJVwiO1xuXG4gICAgaWYgKHggPT09IFwidG9wXCIgfHwgeCA9PT0gXCJib3R0b21cIiB8fCB5ID09PSBcImxlZnRcIiB8fCB5ID09PSBcInJpZ2h0XCIpIHtcbiAgICAgIHZhbHVlID0geDtcbiAgICAgIHggPSB5O1xuICAgICAgeSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHNwbGl0WzBdID0gX2tleXdvcmRUb1BlcmNlbnRbeF0gfHwgeDtcbiAgICBzcGxpdFsxXSA9IF9rZXl3b3JkVG9QZXJjZW50W3ldIHx8IHk7XG4gICAgcmV0dXJuIHNwbGl0LmpvaW4oXCIgXCIpO1xuICB9LFxuICAgICAgX3JlbmRlckNsZWFyUHJvcHMgPSBmdW5jdGlvbiBfcmVuZGVyQ2xlYXJQcm9wcyhyYXRpbywgZGF0YSkge1xuICAgIGlmIChkYXRhLnR3ZWVuICYmIGRhdGEudHdlZW4uX3RpbWUgPT09IGRhdGEudHdlZW4uX2R1cikge1xuICAgICAgdmFyIHRhcmdldCA9IGRhdGEudCxcbiAgICAgICAgICBzdHlsZSA9IHRhcmdldC5zdHlsZSxcbiAgICAgICAgICBwcm9wcyA9IGRhdGEudSxcbiAgICAgICAgICBjYWNoZSA9IHRhcmdldC5fZ3NhcCxcbiAgICAgICAgICBwcm9wLFxuICAgICAgICAgIGNsZWFyVHJhbnNmb3JtcyxcbiAgICAgICAgICBpO1xuXG4gICAgICBpZiAocHJvcHMgPT09IFwiYWxsXCIgfHwgcHJvcHMgPT09IHRydWUpIHtcbiAgICAgICAgc3R5bGUuY3NzVGV4dCA9IFwiXCI7XG4gICAgICAgIGNsZWFyVHJhbnNmb3JtcyA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wcyA9IHByb3BzLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgaSA9IHByb3BzLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoLS1pID4gLTEpIHtcbiAgICAgICAgICBwcm9wID0gcHJvcHNbaV07XG5cbiAgICAgICAgICBpZiAoX3RyYW5zZm9ybVByb3BzW3Byb3BdKSB7XG4gICAgICAgICAgICBjbGVhclRyYW5zZm9ybXMgPSAxO1xuICAgICAgICAgICAgcHJvcCA9IHByb3AgPT09IFwidHJhbnNmb3JtT3JpZ2luXCIgPyBfdHJhbnNmb3JtT3JpZ2luUHJvcCA6IF90cmFuc2Zvcm1Qcm9wO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF9yZW1vdmVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjbGVhclRyYW5zZm9ybXMpIHtcbiAgICAgICAgX3JlbW92ZVByb3BlcnR5KHRhcmdldCwgX3RyYW5zZm9ybVByb3ApO1xuXG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgIGNhY2hlLnN2ZyAmJiB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuXG4gICAgICAgICAgX3BhcnNlVHJhbnNmb3JtKHRhcmdldCwgMSk7XG5cbiAgICAgICAgICBjYWNoZS51bmNhY2hlID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgICAgIF9zcGVjaWFsUHJvcHMgPSB7XG4gICAgY2xlYXJQcm9wczogZnVuY3Rpb24gY2xlYXJQcm9wcyhwbHVnaW4sIHRhcmdldCwgcHJvcGVydHksIGVuZFZhbHVlLCB0d2Vlbikge1xuICAgICAgaWYgKHR3ZWVuLmRhdGEgIT09IFwiaXNGcm9tU3RhcnRcIikge1xuICAgICAgICB2YXIgcHQgPSBwbHVnaW4uX3B0ID0gbmV3IFByb3BUd2VlbihwbHVnaW4uX3B0LCB0YXJnZXQsIHByb3BlcnR5LCAwLCAwLCBfcmVuZGVyQ2xlYXJQcm9wcyk7XG4gICAgICAgIHB0LnUgPSBlbmRWYWx1ZTtcbiAgICAgICAgcHQucHIgPSAtMTA7XG4gICAgICAgIHB0LnR3ZWVuID0gdHdlZW47XG5cbiAgICAgICAgcGx1Z2luLl9wcm9wcy5wdXNoKHByb3BlcnR5KTtcblxuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfaWRlbnRpdHkyRE1hdHJpeCA9IFsxLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIF9yb3RhdGlvbmFsUHJvcGVydGllcyA9IHt9LFxuICAgICAgX2lzTnVsbFRyYW5zZm9ybSA9IGZ1bmN0aW9uIF9pc051bGxUcmFuc2Zvcm0odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IFwibWF0cml4KDEsIDAsIDAsIDEsIDAsIDApXCIgfHwgdmFsdWUgPT09IFwibm9uZVwiIHx8ICF2YWx1ZTtcbiAgfSxcbiAgICAgIF9nZXRDb21wdXRlZFRyYW5zZm9ybU1hdHJpeEFzQXJyYXkgPSBmdW5jdGlvbiBfZ2V0Q29tcHV0ZWRUcmFuc2Zvcm1NYXRyaXhBc0FycmF5KHRhcmdldCkge1xuICAgIHZhciBtYXRyaXhTdHJpbmcgPSBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIF90cmFuc2Zvcm1Qcm9wKTtcblxuICAgIHJldHVybiBfaXNOdWxsVHJhbnNmb3JtKG1hdHJpeFN0cmluZykgPyBfaWRlbnRpdHkyRE1hdHJpeCA6IG1hdHJpeFN0cmluZy5zdWJzdHIoNykubWF0Y2goX251bUV4cCkubWFwKF9yb3VuZCk7XG4gIH0sXG4gICAgICBfZ2V0TWF0cml4ID0gZnVuY3Rpb24gX2dldE1hdHJpeCh0YXJnZXQsIGZvcmNlMkQpIHtcbiAgICB2YXIgY2FjaGUgPSB0YXJnZXQuX2dzYXAgfHwgX2dldENhY2hlKHRhcmdldCksXG4gICAgICAgIHN0eWxlID0gdGFyZ2V0LnN0eWxlLFxuICAgICAgICBtYXRyaXggPSBfZ2V0Q29tcHV0ZWRUcmFuc2Zvcm1NYXRyaXhBc0FycmF5KHRhcmdldCksXG4gICAgICAgIHBhcmVudCxcbiAgICAgICAgbmV4dFNpYmxpbmcsXG4gICAgICAgIHRlbXAsXG4gICAgICAgIGFkZGVkVG9ET007XG5cbiAgICBpZiAoY2FjaGUuc3ZnICYmIHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIikpIHtcbiAgICAgIHRlbXAgPSB0YXJnZXQudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKS5tYXRyaXg7XG4gICAgICBtYXRyaXggPSBbdGVtcC5hLCB0ZW1wLmIsIHRlbXAuYywgdGVtcC5kLCB0ZW1wLmUsIHRlbXAuZl07XG4gICAgICByZXR1cm4gbWF0cml4LmpvaW4oXCIsXCIpID09PSBcIjEsMCwwLDEsMCwwXCIgPyBfaWRlbnRpdHkyRE1hdHJpeCA6IG1hdHJpeDtcbiAgICB9IGVsc2UgaWYgKG1hdHJpeCA9PT0gX2lkZW50aXR5MkRNYXRyaXggJiYgIXRhcmdldC5vZmZzZXRQYXJlbnQgJiYgdGFyZ2V0ICE9PSBfZG9jRWxlbWVudCAmJiAhY2FjaGUuc3ZnKSB7XG4gICAgICB0ZW1wID0gc3R5bGUuZGlzcGxheTtcbiAgICAgIHN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICBwYXJlbnQgPSB0YXJnZXQucGFyZW50Tm9kZTtcblxuICAgICAgaWYgKCFwYXJlbnQgfHwgIXRhcmdldC5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgYWRkZWRUb0RPTSA9IDE7XG4gICAgICAgIG5leHRTaWJsaW5nID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuXG4gICAgICAgIF9kb2NFbGVtZW50LmFwcGVuZENoaWxkKHRhcmdldCk7XG4gICAgICB9XG5cbiAgICAgIG1hdHJpeCA9IF9nZXRDb21wdXRlZFRyYW5zZm9ybU1hdHJpeEFzQXJyYXkodGFyZ2V0KTtcbiAgICAgIHRlbXAgPyBzdHlsZS5kaXNwbGF5ID0gdGVtcCA6IF9yZW1vdmVQcm9wZXJ0eSh0YXJnZXQsIFwiZGlzcGxheVwiKTtcblxuICAgICAgaWYgKGFkZGVkVG9ET00pIHtcbiAgICAgICAgbmV4dFNpYmxpbmcgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRhcmdldCwgbmV4dFNpYmxpbmcpIDogcGFyZW50ID8gcGFyZW50LmFwcGVuZENoaWxkKHRhcmdldCkgOiBfZG9jRWxlbWVudC5yZW1vdmVDaGlsZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3JjZTJEICYmIG1hdHJpeC5sZW5ndGggPiA2ID8gW21hdHJpeFswXSwgbWF0cml4WzFdLCBtYXRyaXhbNF0sIG1hdHJpeFs1XSwgbWF0cml4WzEyXSwgbWF0cml4WzEzXV0gOiBtYXRyaXg7XG4gIH0sXG4gICAgICBfYXBwbHlTVkdPcmlnaW4gPSBmdW5jdGlvbiBfYXBwbHlTVkdPcmlnaW4odGFyZ2V0LCBvcmlnaW4sIG9yaWdpbklzQWJzb2x1dGUsIHNtb290aCwgbWF0cml4QXJyYXksIHBsdWdpblRvQWRkUHJvcFR3ZWVuc1RvKSB7XG4gICAgdmFyIGNhY2hlID0gdGFyZ2V0Ll9nc2FwLFxuICAgICAgICBtYXRyaXggPSBtYXRyaXhBcnJheSB8fCBfZ2V0TWF0cml4KHRhcmdldCwgdHJ1ZSksXG4gICAgICAgIHhPcmlnaW5PbGQgPSBjYWNoZS54T3JpZ2luIHx8IDAsXG4gICAgICAgIHlPcmlnaW5PbGQgPSBjYWNoZS55T3JpZ2luIHx8IDAsXG4gICAgICAgIHhPZmZzZXRPbGQgPSBjYWNoZS54T2Zmc2V0IHx8IDAsXG4gICAgICAgIHlPZmZzZXRPbGQgPSBjYWNoZS55T2Zmc2V0IHx8IDAsXG4gICAgICAgIGEgPSBtYXRyaXhbMF0sXG4gICAgICAgIGIgPSBtYXRyaXhbMV0sXG4gICAgICAgIGMgPSBtYXRyaXhbMl0sXG4gICAgICAgIGQgPSBtYXRyaXhbM10sXG4gICAgICAgIHR4ID0gbWF0cml4WzRdLFxuICAgICAgICB0eSA9IG1hdHJpeFs1XSxcbiAgICAgICAgb3JpZ2luU3BsaXQgPSBvcmlnaW4uc3BsaXQoXCIgXCIpLFxuICAgICAgICB4T3JpZ2luID0gcGFyc2VGbG9hdChvcmlnaW5TcGxpdFswXSkgfHwgMCxcbiAgICAgICAgeU9yaWdpbiA9IHBhcnNlRmxvYXQob3JpZ2luU3BsaXRbMV0pIHx8IDAsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICAgZGV0ZXJtaW5hbnQsXG4gICAgICAgIHgsXG4gICAgICAgIHk7XG5cbiAgICBpZiAoIW9yaWdpbklzQWJzb2x1dGUpIHtcbiAgICAgIGJvdW5kcyA9IF9nZXRCQm94KHRhcmdldCk7XG4gICAgICB4T3JpZ2luID0gYm91bmRzLnggKyAofm9yaWdpblNwbGl0WzBdLmluZGV4T2YoXCIlXCIpID8geE9yaWdpbiAvIDEwMCAqIGJvdW5kcy53aWR0aCA6IHhPcmlnaW4pO1xuICAgICAgeU9yaWdpbiA9IGJvdW5kcy55ICsgKH4ob3JpZ2luU3BsaXRbMV0gfHwgb3JpZ2luU3BsaXRbMF0pLmluZGV4T2YoXCIlXCIpID8geU9yaWdpbiAvIDEwMCAqIGJvdW5kcy5oZWlnaHQgOiB5T3JpZ2luKTtcbiAgICB9IGVsc2UgaWYgKG1hdHJpeCAhPT0gX2lkZW50aXR5MkRNYXRyaXggJiYgKGRldGVybWluYW50ID0gYSAqIGQgLSBiICogYykpIHtcbiAgICAgIHggPSB4T3JpZ2luICogKGQgLyBkZXRlcm1pbmFudCkgKyB5T3JpZ2luICogKC1jIC8gZGV0ZXJtaW5hbnQpICsgKGMgKiB0eSAtIGQgKiB0eCkgLyBkZXRlcm1pbmFudDtcbiAgICAgIHkgPSB4T3JpZ2luICogKC1iIC8gZGV0ZXJtaW5hbnQpICsgeU9yaWdpbiAqIChhIC8gZGV0ZXJtaW5hbnQpIC0gKGEgKiB0eSAtIGIgKiB0eCkgLyBkZXRlcm1pbmFudDtcbiAgICAgIHhPcmlnaW4gPSB4O1xuICAgICAgeU9yaWdpbiA9IHk7XG4gICAgfVxuXG4gICAgaWYgKHNtb290aCB8fCBzbW9vdGggIT09IGZhbHNlICYmIGNhY2hlLnNtb290aCkge1xuICAgICAgdHggPSB4T3JpZ2luIC0geE9yaWdpbk9sZDtcbiAgICAgIHR5ID0geU9yaWdpbiAtIHlPcmlnaW5PbGQ7XG4gICAgICBjYWNoZS54T2Zmc2V0ID0geE9mZnNldE9sZCArICh0eCAqIGEgKyB0eSAqIGMpIC0gdHg7XG4gICAgICBjYWNoZS55T2Zmc2V0ID0geU9mZnNldE9sZCArICh0eCAqIGIgKyB0eSAqIGQpIC0gdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhY2hlLnhPZmZzZXQgPSBjYWNoZS55T2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBjYWNoZS54T3JpZ2luID0geE9yaWdpbjtcbiAgICBjYWNoZS55T3JpZ2luID0geU9yaWdpbjtcbiAgICBjYWNoZS5zbW9vdGggPSAhIXNtb290aDtcbiAgICBjYWNoZS5vcmlnaW4gPSBvcmlnaW47XG4gICAgY2FjaGUub3JpZ2luSXNBYnNvbHV0ZSA9ICEhb3JpZ2luSXNBYnNvbHV0ZTtcbiAgICB0YXJnZXQuc3R5bGVbX3RyYW5zZm9ybU9yaWdpblByb3BdID0gXCIwcHggMHB4XCI7XG5cbiAgICBpZiAocGx1Z2luVG9BZGRQcm9wVHdlZW5zVG8pIHtcbiAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHBsdWdpblRvQWRkUHJvcFR3ZWVuc1RvLCBjYWNoZSwgXCJ4T3JpZ2luXCIsIHhPcmlnaW5PbGQsIHhPcmlnaW4pO1xuXG4gICAgICBfYWRkTm9uVHdlZW5pbmdQVChwbHVnaW5Ub0FkZFByb3BUd2VlbnNUbywgY2FjaGUsIFwieU9yaWdpblwiLCB5T3JpZ2luT2xkLCB5T3JpZ2luKTtcblxuICAgICAgX2FkZE5vblR3ZWVuaW5nUFQocGx1Z2luVG9BZGRQcm9wVHdlZW5zVG8sIGNhY2hlLCBcInhPZmZzZXRcIiwgeE9mZnNldE9sZCwgY2FjaGUueE9mZnNldCk7XG5cbiAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHBsdWdpblRvQWRkUHJvcFR3ZWVuc1RvLCBjYWNoZSwgXCJ5T2Zmc2V0XCIsIHlPZmZzZXRPbGQsIGNhY2hlLnlPZmZzZXQpO1xuICAgIH1cblxuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN2Zy1vcmlnaW5cIiwgeE9yaWdpbiArIFwiIFwiICsgeU9yaWdpbik7XG4gIH0sXG4gICAgICBfcGFyc2VUcmFuc2Zvcm0gPSBmdW5jdGlvbiBfcGFyc2VUcmFuc2Zvcm0odGFyZ2V0LCB1bmNhY2hlKSB7XG4gICAgdmFyIGNhY2hlID0gdGFyZ2V0Ll9nc2FwIHx8IG5ldyBHU0NhY2hlKHRhcmdldCk7XG5cbiAgICBpZiAoXCJ4XCIgaW4gY2FjaGUgJiYgIXVuY2FjaGUgJiYgIWNhY2hlLnVuY2FjaGUpIHtcbiAgICAgIHJldHVybiBjYWNoZTtcbiAgICB9XG5cbiAgICB2YXIgc3R5bGUgPSB0YXJnZXQuc3R5bGUsXG4gICAgICAgIGludmVydGVkU2NhbGVYID0gY2FjaGUuc2NhbGVYIDwgMCxcbiAgICAgICAgcHggPSBcInB4XCIsXG4gICAgICAgIGRlZyA9IFwiZGVnXCIsXG4gICAgICAgIG9yaWdpbiA9IF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgX3RyYW5zZm9ybU9yaWdpblByb3ApIHx8IFwiMFwiLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICB6LFxuICAgICAgICBzY2FsZVgsXG4gICAgICAgIHNjYWxlWSxcbiAgICAgICAgcm90YXRpb24sXG4gICAgICAgIHJvdGF0aW9uWCxcbiAgICAgICAgcm90YXRpb25ZLFxuICAgICAgICBza2V3WCxcbiAgICAgICAgc2tld1ksXG4gICAgICAgIHBlcnNwZWN0aXZlLFxuICAgICAgICB4T3JpZ2luLFxuICAgICAgICB5T3JpZ2luLFxuICAgICAgICBtYXRyaXgsXG4gICAgICAgIGFuZ2xlLFxuICAgICAgICBjb3MsXG4gICAgICAgIHNpbixcbiAgICAgICAgYSxcbiAgICAgICAgYixcbiAgICAgICAgYyxcbiAgICAgICAgZCxcbiAgICAgICAgYTEyLFxuICAgICAgICBhMjIsXG4gICAgICAgIHQxLFxuICAgICAgICB0MixcbiAgICAgICAgdDMsXG4gICAgICAgIGExMyxcbiAgICAgICAgYTIzLFxuICAgICAgICBhMzMsXG4gICAgICAgIGE0MixcbiAgICAgICAgYTQzLFxuICAgICAgICBhMzI7XG4gICAgeCA9IHkgPSB6ID0gcm90YXRpb24gPSByb3RhdGlvblggPSByb3RhdGlvblkgPSBza2V3WCA9IHNrZXdZID0gcGVyc3BlY3RpdmUgPSAwO1xuICAgIHNjYWxlWCA9IHNjYWxlWSA9IDE7XG4gICAgY2FjaGUuc3ZnID0gISEodGFyZ2V0LmdldENUTSAmJiBfaXNTVkcodGFyZ2V0KSk7XG4gICAgbWF0cml4ID0gX2dldE1hdHJpeCh0YXJnZXQsIGNhY2hlLnN2Zyk7XG5cbiAgICBpZiAoY2FjaGUuc3ZnKSB7XG4gICAgICB0MSA9ICghY2FjaGUudW5jYWNoZSB8fCBvcmlnaW4gPT09IFwiMHB4IDBweFwiKSAmJiAhdW5jYWNoZSAmJiB0YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdmctb3JpZ2luXCIpO1xuXG4gICAgICBfYXBwbHlTVkdPcmlnaW4odGFyZ2V0LCB0MSB8fCBvcmlnaW4sICEhdDEgfHwgY2FjaGUub3JpZ2luSXNBYnNvbHV0ZSwgY2FjaGUuc21vb3RoICE9PSBmYWxzZSwgbWF0cml4KTtcbiAgICB9XG5cbiAgICB4T3JpZ2luID0gY2FjaGUueE9yaWdpbiB8fCAwO1xuICAgIHlPcmlnaW4gPSBjYWNoZS55T3JpZ2luIHx8IDA7XG5cbiAgICBpZiAobWF0cml4ICE9PSBfaWRlbnRpdHkyRE1hdHJpeCkge1xuICAgICAgYSA9IG1hdHJpeFswXTtcbiAgICAgIGIgPSBtYXRyaXhbMV07XG4gICAgICBjID0gbWF0cml4WzJdO1xuICAgICAgZCA9IG1hdHJpeFszXTtcbiAgICAgIHggPSBhMTIgPSBtYXRyaXhbNF07XG4gICAgICB5ID0gYTIyID0gbWF0cml4WzVdO1xuXG4gICAgICBpZiAobWF0cml4Lmxlbmd0aCA9PT0gNikge1xuICAgICAgICBzY2FsZVggPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYik7XG4gICAgICAgIHNjYWxlWSA9IE1hdGguc3FydChkICogZCArIGMgKiBjKTtcbiAgICAgICAgcm90YXRpb24gPSBhIHx8IGIgPyBfYXRhbjIoYiwgYSkgKiBfUkFEMkRFRyA6IDA7XG4gICAgICAgIHNrZXdYID0gYyB8fCBkID8gX2F0YW4yKGMsIGQpICogX1JBRDJERUcgKyByb3RhdGlvbiA6IDA7XG4gICAgICAgIHNrZXdYICYmIChzY2FsZVkgKj0gTWF0aC5hYnMoTWF0aC5jb3Moc2tld1ggKiBfREVHMlJBRCkpKTtcblxuICAgICAgICBpZiAoY2FjaGUuc3ZnKSB7XG4gICAgICAgICAgeCAtPSB4T3JpZ2luIC0gKHhPcmlnaW4gKiBhICsgeU9yaWdpbiAqIGMpO1xuICAgICAgICAgIHkgLT0geU9yaWdpbiAtICh4T3JpZ2luICogYiArIHlPcmlnaW4gKiBkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYTMyID0gbWF0cml4WzZdO1xuICAgICAgICBhNDIgPSBtYXRyaXhbN107XG4gICAgICAgIGExMyA9IG1hdHJpeFs4XTtcbiAgICAgICAgYTIzID0gbWF0cml4WzldO1xuICAgICAgICBhMzMgPSBtYXRyaXhbMTBdO1xuICAgICAgICBhNDMgPSBtYXRyaXhbMTFdO1xuICAgICAgICB4ID0gbWF0cml4WzEyXTtcbiAgICAgICAgeSA9IG1hdHJpeFsxM107XG4gICAgICAgIHogPSBtYXRyaXhbMTRdO1xuICAgICAgICBhbmdsZSA9IF9hdGFuMihhMzIsIGEzMyk7XG4gICAgICAgIHJvdGF0aW9uWCA9IGFuZ2xlICogX1JBRDJERUc7XG5cbiAgICAgICAgaWYgKGFuZ2xlKSB7XG4gICAgICAgICAgY29zID0gTWF0aC5jb3MoLWFuZ2xlKTtcbiAgICAgICAgICBzaW4gPSBNYXRoLnNpbigtYW5nbGUpO1xuICAgICAgICAgIHQxID0gYTEyICogY29zICsgYTEzICogc2luO1xuICAgICAgICAgIHQyID0gYTIyICogY29zICsgYTIzICogc2luO1xuICAgICAgICAgIHQzID0gYTMyICogY29zICsgYTMzICogc2luO1xuICAgICAgICAgIGExMyA9IGExMiAqIC1zaW4gKyBhMTMgKiBjb3M7XG4gICAgICAgICAgYTIzID0gYTIyICogLXNpbiArIGEyMyAqIGNvcztcbiAgICAgICAgICBhMzMgPSBhMzIgKiAtc2luICsgYTMzICogY29zO1xuICAgICAgICAgIGE0MyA9IGE0MiAqIC1zaW4gKyBhNDMgKiBjb3M7XG4gICAgICAgICAgYTEyID0gdDE7XG4gICAgICAgICAgYTIyID0gdDI7XG4gICAgICAgICAgYTMyID0gdDM7XG4gICAgICAgIH1cblxuICAgICAgICBhbmdsZSA9IF9hdGFuMigtYywgYTMzKTtcbiAgICAgICAgcm90YXRpb25ZID0gYW5nbGUgKiBfUkFEMkRFRztcblxuICAgICAgICBpZiAoYW5nbGUpIHtcbiAgICAgICAgICBjb3MgPSBNYXRoLmNvcygtYW5nbGUpO1xuICAgICAgICAgIHNpbiA9IE1hdGguc2luKC1hbmdsZSk7XG4gICAgICAgICAgdDEgPSBhICogY29zIC0gYTEzICogc2luO1xuICAgICAgICAgIHQyID0gYiAqIGNvcyAtIGEyMyAqIHNpbjtcbiAgICAgICAgICB0MyA9IGMgKiBjb3MgLSBhMzMgKiBzaW47XG4gICAgICAgICAgYTQzID0gZCAqIHNpbiArIGE0MyAqIGNvcztcbiAgICAgICAgICBhID0gdDE7XG4gICAgICAgICAgYiA9IHQyO1xuICAgICAgICAgIGMgPSB0MztcbiAgICAgICAgfVxuXG4gICAgICAgIGFuZ2xlID0gX2F0YW4yKGIsIGEpO1xuICAgICAgICByb3RhdGlvbiA9IGFuZ2xlICogX1JBRDJERUc7XG5cbiAgICAgICAgaWYgKGFuZ2xlKSB7XG4gICAgICAgICAgY29zID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgICB0MSA9IGEgKiBjb3MgKyBiICogc2luO1xuICAgICAgICAgIHQyID0gYTEyICogY29zICsgYTIyICogc2luO1xuICAgICAgICAgIGIgPSBiICogY29zIC0gYSAqIHNpbjtcbiAgICAgICAgICBhMjIgPSBhMjIgKiBjb3MgLSBhMTIgKiBzaW47XG4gICAgICAgICAgYSA9IHQxO1xuICAgICAgICAgIGExMiA9IHQyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdGF0aW9uWCAmJiBNYXRoLmFicyhyb3RhdGlvblgpICsgTWF0aC5hYnMocm90YXRpb24pID4gMzU5LjkpIHtcbiAgICAgICAgICByb3RhdGlvblggPSByb3RhdGlvbiA9IDA7XG4gICAgICAgICAgcm90YXRpb25ZID0gMTgwIC0gcm90YXRpb25ZO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGVYID0gX3JvdW5kKE1hdGguc3FydChhICogYSArIGIgKiBiICsgYyAqIGMpKTtcbiAgICAgICAgc2NhbGVZID0gX3JvdW5kKE1hdGguc3FydChhMjIgKiBhMjIgKyBhMzIgKiBhMzIpKTtcbiAgICAgICAgYW5nbGUgPSBfYXRhbjIoYTEyLCBhMjIpO1xuICAgICAgICBza2V3WCA9IE1hdGguYWJzKGFuZ2xlKSA+IDAuMDAwMiA/IGFuZ2xlICogX1JBRDJERUcgOiAwO1xuICAgICAgICBwZXJzcGVjdGl2ZSA9IGE0MyA/IDEgLyAoYTQzIDwgMCA/IC1hNDMgOiBhNDMpIDogMDtcbiAgICAgIH1cblxuICAgICAgaWYgKGNhY2hlLnN2Zykge1xuICAgICAgICB0MSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIik7XG4gICAgICAgIGNhY2hlLmZvcmNlQ1NTID0gdGFyZ2V0LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBcIlwiKSB8fCAhX2lzTnVsbFRyYW5zZm9ybShfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIF90cmFuc2Zvcm1Qcm9wKSk7XG4gICAgICAgIHQxICYmIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChNYXRoLmFicyhza2V3WCkgPiA5MCAmJiBNYXRoLmFicyhza2V3WCkgPCAyNzApIHtcbiAgICAgIGlmIChpbnZlcnRlZFNjYWxlWCkge1xuICAgICAgICBzY2FsZVggKj0gLTE7XG4gICAgICAgIHNrZXdYICs9IHJvdGF0aW9uIDw9IDAgPyAxODAgOiAtMTgwO1xuICAgICAgICByb3RhdGlvbiArPSByb3RhdGlvbiA8PSAwID8gMTgwIDogLTE4MDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlWSAqPSAtMTtcbiAgICAgICAgc2tld1ggKz0gc2tld1ggPD0gMCA/IDE4MCA6IC0xODA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FjaGUueCA9IHggLSAoKGNhY2hlLnhQZXJjZW50ID0geCAmJiAoY2FjaGUueFBlcmNlbnQgfHwgKE1hdGgucm91bmQodGFyZ2V0Lm9mZnNldFdpZHRoIC8gMikgPT09IE1hdGgucm91bmQoLXgpID8gLTUwIDogMCkpKSA/IHRhcmdldC5vZmZzZXRXaWR0aCAqIGNhY2hlLnhQZXJjZW50IC8gMTAwIDogMCkgKyBweDtcbiAgICBjYWNoZS55ID0geSAtICgoY2FjaGUueVBlcmNlbnQgPSB5ICYmIChjYWNoZS55UGVyY2VudCB8fCAoTWF0aC5yb3VuZCh0YXJnZXQub2Zmc2V0SGVpZ2h0IC8gMikgPT09IE1hdGgucm91bmQoLXkpID8gLTUwIDogMCkpKSA/IHRhcmdldC5vZmZzZXRIZWlnaHQgKiBjYWNoZS55UGVyY2VudCAvIDEwMCA6IDApICsgcHg7XG4gICAgY2FjaGUueiA9IHogKyBweDtcbiAgICBjYWNoZS5zY2FsZVggPSBfcm91bmQoc2NhbGVYKTtcbiAgICBjYWNoZS5zY2FsZVkgPSBfcm91bmQoc2NhbGVZKTtcbiAgICBjYWNoZS5yb3RhdGlvbiA9IF9yb3VuZChyb3RhdGlvbikgKyBkZWc7XG4gICAgY2FjaGUucm90YXRpb25YID0gX3JvdW5kKHJvdGF0aW9uWCkgKyBkZWc7XG4gICAgY2FjaGUucm90YXRpb25ZID0gX3JvdW5kKHJvdGF0aW9uWSkgKyBkZWc7XG4gICAgY2FjaGUuc2tld1ggPSBza2V3WCArIGRlZztcbiAgICBjYWNoZS5za2V3WSA9IHNrZXdZICsgZGVnO1xuICAgIGNhY2hlLnRyYW5zZm9ybVBlcnNwZWN0aXZlID0gcGVyc3BlY3RpdmUgKyBweDtcblxuICAgIGlmIChjYWNoZS56T3JpZ2luID0gcGFyc2VGbG9hdChvcmlnaW4uc3BsaXQoXCIgXCIpWzJdKSB8fCAwKSB7XG4gICAgICBzdHlsZVtfdHJhbnNmb3JtT3JpZ2luUHJvcF0gPSBfZmlyc3RUd29Pbmx5KG9yaWdpbik7XG4gICAgfVxuXG4gICAgY2FjaGUueE9mZnNldCA9IGNhY2hlLnlPZmZzZXQgPSAwO1xuICAgIGNhY2hlLmZvcmNlM0QgPSBfY29uZmlnLmZvcmNlM0Q7XG4gICAgY2FjaGUucmVuZGVyVHJhbnNmb3JtID0gY2FjaGUuc3ZnID8gX3JlbmRlclNWR1RyYW5zZm9ybXMgOiBfc3VwcG9ydHMzRCA/IF9yZW5kZXJDU1NUcmFuc2Zvcm1zIDogX3JlbmRlck5vbjNEVHJhbnNmb3JtcztcbiAgICBjYWNoZS51bmNhY2hlID0gMDtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH0sXG4gICAgICBfZmlyc3RUd29Pbmx5ID0gZnVuY3Rpb24gX2ZpcnN0VHdvT25seSh2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgPSB2YWx1ZS5zcGxpdChcIiBcIikpWzBdICsgXCIgXCIgKyB2YWx1ZVsxXTtcbiAgfSxcbiAgICAgIF9hZGRQeFRyYW5zbGF0ZSA9IGZ1bmN0aW9uIF9hZGRQeFRyYW5zbGF0ZSh0YXJnZXQsIHN0YXJ0LCB2YWx1ZSkge1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdChzdGFydCk7XG4gICAgcmV0dXJuIF9yb3VuZChwYXJzZUZsb2F0KHN0YXJ0KSArIHBhcnNlRmxvYXQoX2NvbnZlcnRUb1VuaXQodGFyZ2V0LCBcInhcIiwgdmFsdWUgKyBcInB4XCIsIHVuaXQpKSkgKyB1bml0O1xuICB9LFxuICAgICAgX3JlbmRlck5vbjNEVHJhbnNmb3JtcyA9IGZ1bmN0aW9uIF9yZW5kZXJOb24zRFRyYW5zZm9ybXMocmF0aW8sIGNhY2hlKSB7XG4gICAgY2FjaGUueiA9IFwiMHB4XCI7XG4gICAgY2FjaGUucm90YXRpb25ZID0gY2FjaGUucm90YXRpb25YID0gXCIwZGVnXCI7XG4gICAgY2FjaGUuZm9yY2UzRCA9IDA7XG5cbiAgICBfcmVuZGVyQ1NTVHJhbnNmb3JtcyhyYXRpbywgY2FjaGUpO1xuICB9LFxuICAgICAgX3plcm9EZWcgPSBcIjBkZWdcIixcbiAgICAgIF96ZXJvUHggPSBcIjBweFwiLFxuICAgICAgX2VuZFBhcmVudGhlc2lzID0gXCIpIFwiLFxuICAgICAgX3JlbmRlckNTU1RyYW5zZm9ybXMgPSBmdW5jdGlvbiBfcmVuZGVyQ1NTVHJhbnNmb3JtcyhyYXRpbywgY2FjaGUpIHtcbiAgICB2YXIgX3JlZiA9IGNhY2hlIHx8IHRoaXMsXG4gICAgICAgIHhQZXJjZW50ID0gX3JlZi54UGVyY2VudCxcbiAgICAgICAgeVBlcmNlbnQgPSBfcmVmLnlQZXJjZW50LFxuICAgICAgICB4ID0gX3JlZi54LFxuICAgICAgICB5ID0gX3JlZi55LFxuICAgICAgICB6ID0gX3JlZi56LFxuICAgICAgICByb3RhdGlvbiA9IF9yZWYucm90YXRpb24sXG4gICAgICAgIHJvdGF0aW9uWSA9IF9yZWYucm90YXRpb25ZLFxuICAgICAgICByb3RhdGlvblggPSBfcmVmLnJvdGF0aW9uWCxcbiAgICAgICAgc2tld1ggPSBfcmVmLnNrZXdYLFxuICAgICAgICBza2V3WSA9IF9yZWYuc2tld1ksXG4gICAgICAgIHNjYWxlWCA9IF9yZWYuc2NhbGVYLFxuICAgICAgICBzY2FsZVkgPSBfcmVmLnNjYWxlWSxcbiAgICAgICAgdHJhbnNmb3JtUGVyc3BlY3RpdmUgPSBfcmVmLnRyYW5zZm9ybVBlcnNwZWN0aXZlLFxuICAgICAgICBmb3JjZTNEID0gX3JlZi5mb3JjZTNELFxuICAgICAgICB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgICAgek9yaWdpbiA9IF9yZWYuek9yaWdpbixcbiAgICAgICAgdHJhbnNmb3JtcyA9IFwiXCIsXG4gICAgICAgIHVzZTNEID0gZm9yY2UzRCA9PT0gXCJhdXRvXCIgJiYgcmF0aW8gJiYgcmF0aW8gIT09IDEgfHwgZm9yY2UzRCA9PT0gdHJ1ZTtcblxuICAgIGlmICh6T3JpZ2luICYmIChyb3RhdGlvblggIT09IF96ZXJvRGVnIHx8IHJvdGF0aW9uWSAhPT0gX3plcm9EZWcpKSB7XG4gICAgICB2YXIgYW5nbGUgPSBwYXJzZUZsb2F0KHJvdGF0aW9uWSkgKiBfREVHMlJBRCxcbiAgICAgICAgICBhMTMgPSBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgYTMzID0gTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgIGNvcztcblxuICAgICAgYW5nbGUgPSBwYXJzZUZsb2F0KHJvdGF0aW9uWCkgKiBfREVHMlJBRDtcbiAgICAgIGNvcyA9IE1hdGguY29zKGFuZ2xlKTtcbiAgICAgIHggPSBfYWRkUHhUcmFuc2xhdGUodGFyZ2V0LCB4LCBhMTMgKiBjb3MgKiAtek9yaWdpbik7XG4gICAgICB5ID0gX2FkZFB4VHJhbnNsYXRlKHRhcmdldCwgeSwgLU1hdGguc2luKGFuZ2xlKSAqIC16T3JpZ2luKTtcbiAgICAgIHogPSBfYWRkUHhUcmFuc2xhdGUodGFyZ2V0LCB6LCBhMzMgKiBjb3MgKiAtek9yaWdpbiArIHpPcmlnaW4pO1xuICAgIH1cblxuICAgIGlmICh0cmFuc2Zvcm1QZXJzcGVjdGl2ZSAhPT0gX3plcm9QeCkge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInBlcnNwZWN0aXZlKFwiICsgdHJhbnNmb3JtUGVyc3BlY3RpdmUgKyBfZW5kUGFyZW50aGVzaXM7XG4gICAgfVxuXG4gICAgaWYgKHhQZXJjZW50IHx8IHlQZXJjZW50KSB7XG4gICAgICB0cmFuc2Zvcm1zICs9IFwidHJhbnNsYXRlKFwiICsgeFBlcmNlbnQgKyBcIiUsIFwiICsgeVBlcmNlbnQgKyBcIiUpIFwiO1xuICAgIH1cblxuICAgIGlmICh1c2UzRCB8fCB4ICE9PSBfemVyb1B4IHx8IHkgIT09IF96ZXJvUHggfHwgeiAhPT0gX3plcm9QeCkge1xuICAgICAgdHJhbnNmb3JtcyArPSB6ICE9PSBfemVyb1B4IHx8IHVzZTNEID8gXCJ0cmFuc2xhdGUzZChcIiArIHggKyBcIiwgXCIgKyB5ICsgXCIsIFwiICsgeiArIFwiKSBcIiA6IFwidHJhbnNsYXRlKFwiICsgeCArIFwiLCBcIiArIHkgKyBfZW5kUGFyZW50aGVzaXM7XG4gICAgfVxuXG4gICAgaWYgKHJvdGF0aW9uICE9PSBfemVyb0RlZykge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInJvdGF0ZShcIiArIHJvdGF0aW9uICsgX2VuZFBhcmVudGhlc2lzO1xuICAgIH1cblxuICAgIGlmIChyb3RhdGlvblkgIT09IF96ZXJvRGVnKSB7XG4gICAgICB0cmFuc2Zvcm1zICs9IFwicm90YXRlWShcIiArIHJvdGF0aW9uWSArIF9lbmRQYXJlbnRoZXNpcztcbiAgICB9XG5cbiAgICBpZiAocm90YXRpb25YICE9PSBfemVyb0RlZykge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInJvdGF0ZVgoXCIgKyByb3RhdGlvblggKyBfZW5kUGFyZW50aGVzaXM7XG4gICAgfVxuXG4gICAgaWYgKHNrZXdYICE9PSBfemVyb0RlZyB8fCBza2V3WSAhPT0gX3plcm9EZWcpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0gXCJza2V3KFwiICsgc2tld1ggKyBcIiwgXCIgKyBza2V3WSArIF9lbmRQYXJlbnRoZXNpcztcbiAgICB9XG5cbiAgICBpZiAoc2NhbGVYICE9PSAxIHx8IHNjYWxlWSAhPT0gMSkge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInNjYWxlKFwiICsgc2NhbGVYICsgXCIsIFwiICsgc2NhbGVZICsgX2VuZFBhcmVudGhlc2lzO1xuICAgIH1cblxuICAgIHRhcmdldC5zdHlsZVtfdHJhbnNmb3JtUHJvcF0gPSB0cmFuc2Zvcm1zIHx8IFwidHJhbnNsYXRlKDAsIDApXCI7XG4gIH0sXG4gICAgICBfcmVuZGVyU1ZHVHJhbnNmb3JtcyA9IGZ1bmN0aW9uIF9yZW5kZXJTVkdUcmFuc2Zvcm1zKHJhdGlvLCBjYWNoZSkge1xuICAgIHZhciBfcmVmMiA9IGNhY2hlIHx8IHRoaXMsXG4gICAgICAgIHhQZXJjZW50ID0gX3JlZjIueFBlcmNlbnQsXG4gICAgICAgIHlQZXJjZW50ID0gX3JlZjIueVBlcmNlbnQsXG4gICAgICAgIHggPSBfcmVmMi54LFxuICAgICAgICB5ID0gX3JlZjIueSxcbiAgICAgICAgcm90YXRpb24gPSBfcmVmMi5yb3RhdGlvbixcbiAgICAgICAgc2tld1ggPSBfcmVmMi5za2V3WCxcbiAgICAgICAgc2tld1kgPSBfcmVmMi5za2V3WSxcbiAgICAgICAgc2NhbGVYID0gX3JlZjIuc2NhbGVYLFxuICAgICAgICBzY2FsZVkgPSBfcmVmMi5zY2FsZVksXG4gICAgICAgIHRhcmdldCA9IF9yZWYyLnRhcmdldCxcbiAgICAgICAgeE9yaWdpbiA9IF9yZWYyLnhPcmlnaW4sXG4gICAgICAgIHlPcmlnaW4gPSBfcmVmMi55T3JpZ2luLFxuICAgICAgICB4T2Zmc2V0ID0gX3JlZjIueE9mZnNldCxcbiAgICAgICAgeU9mZnNldCA9IF9yZWYyLnlPZmZzZXQsXG4gICAgICAgIGZvcmNlQ1NTID0gX3JlZjIuZm9yY2VDU1MsXG4gICAgICAgIHR4ID0gcGFyc2VGbG9hdCh4KSxcbiAgICAgICAgdHkgPSBwYXJzZUZsb2F0KHkpLFxuICAgICAgICBhMTEsXG4gICAgICAgIGEyMSxcbiAgICAgICAgYTEyLFxuICAgICAgICBhMjIsXG4gICAgICAgIHRlbXA7XG5cbiAgICByb3RhdGlvbiA9IHBhcnNlRmxvYXQocm90YXRpb24pO1xuICAgIHNrZXdYID0gcGFyc2VGbG9hdChza2V3WCk7XG4gICAgc2tld1kgPSBwYXJzZUZsb2F0KHNrZXdZKTtcblxuICAgIGlmIChza2V3WSkge1xuICAgICAgc2tld1kgPSBwYXJzZUZsb2F0KHNrZXdZKTtcbiAgICAgIHNrZXdYICs9IHNrZXdZO1xuICAgICAgcm90YXRpb24gKz0gc2tld1k7XG4gICAgfVxuXG4gICAgaWYgKHJvdGF0aW9uIHx8IHNrZXdYKSB7XG4gICAgICByb3RhdGlvbiAqPSBfREVHMlJBRDtcbiAgICAgIHNrZXdYICo9IF9ERUcyUkFEO1xuICAgICAgYTExID0gTWF0aC5jb3Mocm90YXRpb24pICogc2NhbGVYO1xuICAgICAgYTIxID0gTWF0aC5zaW4ocm90YXRpb24pICogc2NhbGVYO1xuICAgICAgYTEyID0gTWF0aC5zaW4ocm90YXRpb24gLSBza2V3WCkgKiAtc2NhbGVZO1xuICAgICAgYTIyID0gTWF0aC5jb3Mocm90YXRpb24gLSBza2V3WCkgKiBzY2FsZVk7XG5cbiAgICAgIGlmIChza2V3WCkge1xuICAgICAgICBza2V3WSAqPSBfREVHMlJBRDtcbiAgICAgICAgdGVtcCA9IE1hdGgudGFuKHNrZXdYIC0gc2tld1kpO1xuICAgICAgICB0ZW1wID0gTWF0aC5zcXJ0KDEgKyB0ZW1wICogdGVtcCk7XG4gICAgICAgIGExMiAqPSB0ZW1wO1xuICAgICAgICBhMjIgKj0gdGVtcDtcblxuICAgICAgICBpZiAoc2tld1kpIHtcbiAgICAgICAgICB0ZW1wID0gTWF0aC50YW4oc2tld1kpO1xuICAgICAgICAgIHRlbXAgPSBNYXRoLnNxcnQoMSArIHRlbXAgKiB0ZW1wKTtcbiAgICAgICAgICBhMTEgKj0gdGVtcDtcbiAgICAgICAgICBhMjEgKj0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhMTEgPSBfcm91bmQoYTExKTtcbiAgICAgIGEyMSA9IF9yb3VuZChhMjEpO1xuICAgICAgYTEyID0gX3JvdW5kKGExMik7XG4gICAgICBhMjIgPSBfcm91bmQoYTIyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYTExID0gc2NhbGVYO1xuICAgICAgYTIyID0gc2NhbGVZO1xuICAgICAgYTIxID0gYTEyID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHggJiYgIX4oeCArIFwiXCIpLmluZGV4T2YoXCJweFwiKSB8fCB0eSAmJiAhfih5ICsgXCJcIikuaW5kZXhPZihcInB4XCIpKSB7XG4gICAgICB0eCA9IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgXCJ4XCIsIHgsIFwicHhcIik7XG4gICAgICB0eSA9IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgXCJ5XCIsIHksIFwicHhcIik7XG4gICAgfVxuXG4gICAgaWYgKHhPcmlnaW4gfHwgeU9yaWdpbiB8fCB4T2Zmc2V0IHx8IHlPZmZzZXQpIHtcbiAgICAgIHR4ID0gX3JvdW5kKHR4ICsgeE9yaWdpbiAtICh4T3JpZ2luICogYTExICsgeU9yaWdpbiAqIGExMikgKyB4T2Zmc2V0KTtcbiAgICAgIHR5ID0gX3JvdW5kKHR5ICsgeU9yaWdpbiAtICh4T3JpZ2luICogYTIxICsgeU9yaWdpbiAqIGEyMikgKyB5T2Zmc2V0KTtcbiAgICB9XG5cbiAgICBpZiAoeFBlcmNlbnQgfHwgeVBlcmNlbnQpIHtcbiAgICAgIHRlbXAgPSB0YXJnZXQuZ2V0QkJveCgpO1xuICAgICAgdHggPSBfcm91bmQodHggKyB4UGVyY2VudCAvIDEwMCAqIHRlbXAud2lkdGgpO1xuICAgICAgdHkgPSBfcm91bmQodHkgKyB5UGVyY2VudCAvIDEwMCAqIHRlbXAuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICB0ZW1wID0gXCJtYXRyaXgoXCIgKyBhMTEgKyBcIixcIiArIGEyMSArIFwiLFwiICsgYTEyICsgXCIsXCIgKyBhMjIgKyBcIixcIiArIHR4ICsgXCIsXCIgKyB0eSArIFwiKVwiO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdGVtcCk7XG4gICAgZm9yY2VDU1MgJiYgKHRhcmdldC5zdHlsZVtfdHJhbnNmb3JtUHJvcF0gPSB0ZW1wKTtcbiAgfSxcbiAgICAgIF9hZGRSb3RhdGlvbmFsUHJvcFR3ZWVuID0gZnVuY3Rpb24gX2FkZFJvdGF0aW9uYWxQcm9wVHdlZW4ocGx1Z2luLCB0YXJnZXQsIHByb3BlcnR5LCBzdGFydE51bSwgZW5kVmFsdWUsIHJlbGF0aXZlKSB7XG4gICAgdmFyIGNhcCA9IDM2MCxcbiAgICAgICAgaXNTdHJpbmcgPSBfaXNTdHJpbmcoZW5kVmFsdWUpLFxuICAgICAgICBlbmROdW0gPSBwYXJzZUZsb2F0KGVuZFZhbHVlKSAqIChpc1N0cmluZyAmJiB+ZW5kVmFsdWUuaW5kZXhPZihcInJhZFwiKSA/IF9SQUQyREVHIDogMSksXG4gICAgICAgIGNoYW5nZSA9IHJlbGF0aXZlID8gZW5kTnVtICogcmVsYXRpdmUgOiBlbmROdW0gLSBzdGFydE51bSxcbiAgICAgICAgZmluYWxWYWx1ZSA9IHN0YXJ0TnVtICsgY2hhbmdlICsgXCJkZWdcIixcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICBwdDtcblxuICAgIGlmIChpc1N0cmluZykge1xuICAgICAgZGlyZWN0aW9uID0gZW5kVmFsdWUuc3BsaXQoXCJfXCIpWzFdO1xuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSBcInNob3J0XCIpIHtcbiAgICAgICAgY2hhbmdlICU9IGNhcDtcblxuICAgICAgICBpZiAoY2hhbmdlICE9PSBjaGFuZ2UgJSAoY2FwIC8gMikpIHtcbiAgICAgICAgICBjaGFuZ2UgKz0gY2hhbmdlIDwgMCA/IGNhcCA6IC1jYXA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJjd1wiICYmIGNoYW5nZSA8IDApIHtcbiAgICAgICAgY2hhbmdlID0gKGNoYW5nZSArIGNhcCAqIF9iaWdOdW0kMSkgJSBjYXAgLSB+fihjaGFuZ2UgLyBjYXApICogY2FwO1xuICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IFwiY2N3XCIgJiYgY2hhbmdlID4gMCkge1xuICAgICAgICBjaGFuZ2UgPSAoY2hhbmdlIC0gY2FwICogX2JpZ051bSQxKSAlIGNhcCAtIH5+KGNoYW5nZSAvIGNhcCkgKiBjYXA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGx1Z2luLl9wdCA9IHB0ID0gbmV3IFByb3BUd2VlbihwbHVnaW4uX3B0LCB0YXJnZXQsIHByb3BlcnR5LCBzdGFydE51bSwgY2hhbmdlLCBfcmVuZGVyUHJvcFdpdGhFbmQpO1xuICAgIHB0LmUgPSBmaW5hbFZhbHVlO1xuICAgIHB0LnUgPSBcImRlZ1wiO1xuXG4gICAgcGx1Z2luLl9wcm9wcy5wdXNoKHByb3BlcnR5KTtcblxuICAgIHJldHVybiBwdDtcbiAgfSxcbiAgICAgIF9hc3NpZ24gPSBmdW5jdGlvbiBfYXNzaWduKHRhcmdldCwgc291cmNlKSB7XG4gICAgZm9yICh2YXIgcCBpbiBzb3VyY2UpIHtcbiAgICAgIHRhcmdldFtwXSA9IHNvdXJjZVtwXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9LFxuICAgICAgX2FkZFJhd1RyYW5zZm9ybVBUcyA9IGZ1bmN0aW9uIF9hZGRSYXdUcmFuc2Zvcm1QVHMocGx1Z2luLCB0cmFuc2Zvcm1zLCB0YXJnZXQpIHtcbiAgICB2YXIgc3RhcnRDYWNoZSA9IF9hc3NpZ24oe30sIHRhcmdldC5fZ3NhcCksXG4gICAgICAgIGV4Y2x1ZGUgPSBcInBlcnNwZWN0aXZlLGZvcmNlM0QsdHJhbnNmb3JtT3JpZ2luLHN2Z09yaWdpblwiLFxuICAgICAgICBzdHlsZSA9IHRhcmdldC5zdHlsZSxcbiAgICAgICAgZW5kQ2FjaGUsXG4gICAgICAgIHAsXG4gICAgICAgIHN0YXJ0VmFsdWUsXG4gICAgICAgIGVuZFZhbHVlLFxuICAgICAgICBzdGFydE51bSxcbiAgICAgICAgZW5kTnVtLFxuICAgICAgICBzdGFydFVuaXQsXG4gICAgICAgIGVuZFVuaXQ7XG5cbiAgICBpZiAoc3RhcnRDYWNoZS5zdmcpIHtcbiAgICAgIHN0YXJ0VmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBcIlwiKTtcbiAgICAgIHN0eWxlW190cmFuc2Zvcm1Qcm9wXSA9IHRyYW5zZm9ybXM7XG4gICAgICBlbmRDYWNoZSA9IF9wYXJzZVRyYW5zZm9ybSh0YXJnZXQsIDEpO1xuXG4gICAgICBfcmVtb3ZlUHJvcGVydHkodGFyZ2V0LCBfdHJhbnNmb3JtUHJvcCk7XG5cbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgc3RhcnRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0VmFsdWUgPSBnZXRDb21wdXRlZFN0eWxlKHRhcmdldClbX3RyYW5zZm9ybVByb3BdO1xuICAgICAgc3R5bGVbX3RyYW5zZm9ybVByb3BdID0gdHJhbnNmb3JtcztcbiAgICAgIGVuZENhY2hlID0gX3BhcnNlVHJhbnNmb3JtKHRhcmdldCwgMSk7XG4gICAgICBzdHlsZVtfdHJhbnNmb3JtUHJvcF0gPSBzdGFydFZhbHVlO1xuICAgIH1cblxuICAgIGZvciAocCBpbiBfdHJhbnNmb3JtUHJvcHMpIHtcbiAgICAgIHN0YXJ0VmFsdWUgPSBzdGFydENhY2hlW3BdO1xuICAgICAgZW5kVmFsdWUgPSBlbmRDYWNoZVtwXTtcblxuICAgICAgaWYgKHN0YXJ0VmFsdWUgIT09IGVuZFZhbHVlICYmIGV4Y2x1ZGUuaW5kZXhPZihwKSA8IDApIHtcbiAgICAgICAgc3RhcnRVbml0ID0gZ2V0VW5pdChzdGFydFZhbHVlKTtcbiAgICAgICAgZW5kVW5pdCA9IGdldFVuaXQoZW5kVmFsdWUpO1xuICAgICAgICBzdGFydE51bSA9IHN0YXJ0VW5pdCAhPT0gZW5kVW5pdCA/IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgcCwgc3RhcnRWYWx1ZSwgZW5kVW5pdCkgOiBwYXJzZUZsb2F0KHN0YXJ0VmFsdWUpO1xuICAgICAgICBlbmROdW0gPSBwYXJzZUZsb2F0KGVuZFZhbHVlKTtcbiAgICAgICAgcGx1Z2luLl9wdCA9IG5ldyBQcm9wVHdlZW4ocGx1Z2luLl9wdCwgZW5kQ2FjaGUsIHAsIHN0YXJ0TnVtLCBlbmROdW0gLSBzdGFydE51bSwgX3JlbmRlckNTU1Byb3ApO1xuICAgICAgICBwbHVnaW4uX3B0LnUgPSBlbmRVbml0IHx8IDA7XG5cbiAgICAgICAgcGx1Z2luLl9wcm9wcy5wdXNoKHApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9hc3NpZ24oZW5kQ2FjaGUsIHN0YXJ0Q2FjaGUpO1xuICB9O1xuXG4gIF9mb3JFYWNoTmFtZShcInBhZGRpbmcsbWFyZ2luLFdpZHRoLFJhZGl1c1wiLCBmdW5jdGlvbiAobmFtZSwgaW5kZXgpIHtcbiAgICB2YXIgdCA9IFwiVG9wXCIsXG4gICAgICAgIHIgPSBcIlJpZ2h0XCIsXG4gICAgICAgIGIgPSBcIkJvdHRvbVwiLFxuICAgICAgICBsID0gXCJMZWZ0XCIsXG4gICAgICAgIHByb3BzID0gKGluZGV4IDwgMyA/IFt0LCByLCBiLCBsXSA6IFt0ICsgbCwgdCArIHIsIGIgKyByLCBiICsgbF0pLm1hcChmdW5jdGlvbiAoc2lkZSkge1xuICAgICAgcmV0dXJuIGluZGV4IDwgMiA/IG5hbWUgKyBzaWRlIDogXCJib3JkZXJcIiArIHNpZGUgKyBuYW1lO1xuICAgIH0pO1xuXG4gICAgX3NwZWNpYWxQcm9wc1tpbmRleCA+IDEgPyBcImJvcmRlclwiICsgbmFtZSA6IG5hbWVdID0gZnVuY3Rpb24gKHBsdWdpbiwgdGFyZ2V0LCBwcm9wZXJ0eSwgZW5kVmFsdWUsIHR3ZWVuKSB7XG4gICAgICB2YXIgYSwgdmFycztcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgIGEgPSBwcm9wcy5tYXAoZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICByZXR1cm4gX2dldChwbHVnaW4sIHByb3AsIHByb3BlcnR5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhcnMgPSBhLmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdmFycy5zcGxpdChhWzBdKS5sZW5ndGggPT09IDUgPyBhWzBdIDogdmFycztcbiAgICAgIH1cblxuICAgICAgYSA9IChlbmRWYWx1ZSArIFwiXCIpLnNwbGl0KFwiIFwiKTtcbiAgICAgIHZhcnMgPSB7fTtcbiAgICAgIHByb3BzLmZvckVhY2goZnVuY3Rpb24gKHByb3AsIGkpIHtcbiAgICAgICAgcmV0dXJuIHZhcnNbcHJvcF0gPSBhW2ldID0gYVtpXSB8fCBhWyhpIC0gMSkgLyAyIHwgMF07XG4gICAgICB9KTtcbiAgICAgIHBsdWdpbi5pbml0KHRhcmdldCwgdmFycywgdHdlZW4pO1xuICAgIH07XG4gIH0pO1xuXG4gIHZhciBDU1NQbHVnaW4gPSB7XG4gICAgbmFtZTogXCJjc3NcIixcbiAgICByZWdpc3RlcjogX2luaXRDb3JlLFxuICAgIHRhcmdldFRlc3Q6IGZ1bmN0aW9uIHRhcmdldFRlc3QodGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdGFyZ2V0LnN0eWxlICYmIHRhcmdldC5ub2RlVHlwZTtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQodGFyZ2V0LCB2YXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldHMpIHtcbiAgICAgIHZhciBwcm9wcyA9IHRoaXMuX3Byb3BzLFxuICAgICAgICAgIHN0eWxlID0gdGFyZ2V0LnN0eWxlLFxuICAgICAgICAgIHN0YXJ0QXQgPSB0d2Vlbi52YXJzLnN0YXJ0QXQsXG4gICAgICAgICAgc3RhcnRWYWx1ZSxcbiAgICAgICAgICBlbmRWYWx1ZSxcbiAgICAgICAgICBlbmROdW0sXG4gICAgICAgICAgc3RhcnROdW0sXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgICBzcGVjaWFsUHJvcCxcbiAgICAgICAgICBwLFxuICAgICAgICAgIHN0YXJ0VW5pdCxcbiAgICAgICAgICBlbmRVbml0LFxuICAgICAgICAgIHJlbGF0aXZlLFxuICAgICAgICAgIGlzVHJhbnNmb3JtUmVsYXRlZCxcbiAgICAgICAgICB0cmFuc2Zvcm1Qcm9wVHdlZW4sXG4gICAgICAgICAgY2FjaGUsXG4gICAgICAgICAgc21vb3RoLFxuICAgICAgICAgIGhhc1ByaW9yaXR5O1xuICAgICAgX3BsdWdpbkluaXR0ZWQgfHwgX2luaXRDb3JlKCk7XG5cbiAgICAgIGZvciAocCBpbiB2YXJzKSB7XG4gICAgICAgIGlmIChwID09PSBcImF1dG9Sb3VuZFwiKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBlbmRWYWx1ZSA9IHZhcnNbcF07XG5cbiAgICAgICAgaWYgKF9wbHVnaW5zW3BdICYmIF9jaGVja1BsdWdpbihwLCB2YXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldCwgdGFyZ2V0cykpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSB0eXBlb2YgZW5kVmFsdWU7XG4gICAgICAgIHNwZWNpYWxQcm9wID0gX3NwZWNpYWxQcm9wc1twXTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgZW5kVmFsdWUgPSBlbmRWYWx1ZS5jYWxsKHR3ZWVuLCBpbmRleCwgdGFyZ2V0LCB0YXJnZXRzKTtcbiAgICAgICAgICB0eXBlID0gdHlwZW9mIGVuZFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIgJiYgfmVuZFZhbHVlLmluZGV4T2YoXCJyYW5kb20oXCIpKSB7XG4gICAgICAgICAgZW5kVmFsdWUgPSBfcmVwbGFjZVJhbmRvbShlbmRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3BlY2lhbFByb3ApIHtcbiAgICAgICAgICBzcGVjaWFsUHJvcCh0aGlzLCB0YXJnZXQsIHAsIGVuZFZhbHVlLCB0d2VlbikgJiYgKGhhc1ByaW9yaXR5ID0gMSk7XG4gICAgICAgIH0gZWxzZSBpZiAocC5zdWJzdHIoMCwgMikgPT09IFwiLS1cIikge1xuICAgICAgICAgIHN0YXJ0VmFsdWUgPSAoZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUocCkgKyBcIlwiKS50cmltKCk7XG4gICAgICAgICAgZW5kVmFsdWUgKz0gXCJcIjtcbiAgICAgICAgICBfY29sb3JFeHAubGFzdEluZGV4ID0gMDtcblxuICAgICAgICAgIGlmICghX2NvbG9yRXhwLnRlc3Qoc3RhcnRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHN0YXJ0VW5pdCA9IGdldFVuaXQoc3RhcnRWYWx1ZSk7XG4gICAgICAgICAgICBlbmRVbml0ID0gZ2V0VW5pdChlbmRWYWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZW5kVW5pdCA/IHN0YXJ0VW5pdCAhPT0gZW5kVW5pdCAmJiAoc3RhcnRWYWx1ZSA9IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgcCwgc3RhcnRWYWx1ZSwgZW5kVW5pdCkgKyBlbmRVbml0KSA6IHN0YXJ0VW5pdCAmJiAoZW5kVmFsdWUgKz0gc3RhcnRVbml0KTtcbiAgICAgICAgICB0aGlzLmFkZChzdHlsZSwgXCJzZXRQcm9wZXJ0eVwiLCBzdGFydFZhbHVlLCBlbmRWYWx1ZSwgaW5kZXgsIHRhcmdldHMsIDAsIDAsIHApO1xuICAgICAgICAgIHByb3BzLnB1c2gocCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGlmIChzdGFydEF0ICYmIHAgaW4gc3RhcnRBdCkge1xuICAgICAgICAgICAgc3RhcnRWYWx1ZSA9IHR5cGVvZiBzdGFydEF0W3BdID09PSBcImZ1bmN0aW9uXCIgPyBzdGFydEF0W3BdLmNhbGwodHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpIDogc3RhcnRBdFtwXTtcbiAgICAgICAgICAgIF9pc1N0cmluZyhzdGFydFZhbHVlKSAmJiB+c3RhcnRWYWx1ZS5pbmRleE9mKFwicmFuZG9tKFwiKSAmJiAoc3RhcnRWYWx1ZSA9IF9yZXBsYWNlUmFuZG9tKHN0YXJ0VmFsdWUpKTtcbiAgICAgICAgICAgIGdldFVuaXQoc3RhcnRWYWx1ZSArIFwiXCIpIHx8IChzdGFydFZhbHVlICs9IF9jb25maWcudW5pdHNbcF0gfHwgZ2V0VW5pdChfZ2V0KHRhcmdldCwgcCkpIHx8IFwiXCIpO1xuICAgICAgICAgICAgKHN0YXJ0VmFsdWUgKyBcIlwiKS5jaGFyQXQoMSkgPT09IFwiPVwiICYmIChzdGFydFZhbHVlID0gX2dldCh0YXJnZXQsIHApKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRWYWx1ZSA9IF9nZXQodGFyZ2V0LCBwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzdGFydE51bSA9IHBhcnNlRmxvYXQoc3RhcnRWYWx1ZSk7XG4gICAgICAgICAgcmVsYXRpdmUgPSB0eXBlID09PSBcInN0cmluZ1wiICYmIGVuZFZhbHVlLmNoYXJBdCgxKSA9PT0gXCI9XCIgPyArKGVuZFZhbHVlLmNoYXJBdCgwKSArIFwiMVwiKSA6IDA7XG4gICAgICAgICAgcmVsYXRpdmUgJiYgKGVuZFZhbHVlID0gZW5kVmFsdWUuc3Vic3RyKDIpKTtcbiAgICAgICAgICBlbmROdW0gPSBwYXJzZUZsb2F0KGVuZFZhbHVlKTtcblxuICAgICAgICAgIGlmIChwIGluIF9wcm9wZXJ0eUFsaWFzZXMpIHtcbiAgICAgICAgICAgIGlmIChwID09PSBcImF1dG9BbHBoYVwiKSB7XG4gICAgICAgICAgICAgIGlmIChzdGFydE51bSA9PT0gMSAmJiBfZ2V0KHRhcmdldCwgXCJ2aXNpYmlsaXR5XCIpID09PSBcImhpZGRlblwiICYmIGVuZE51bSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0TnVtID0gMDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHRoaXMsIHN0eWxlLCBcInZpc2liaWxpdHlcIiwgc3RhcnROdW0gPyBcImluaGVyaXRcIiA6IFwiaGlkZGVuXCIsIGVuZE51bSA/IFwiaW5oZXJpdFwiIDogXCJoaWRkZW5cIiwgIWVuZE51bSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwICE9PSBcInNjYWxlXCIgJiYgcCAhPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICBwID0gX3Byb3BlcnR5QWxpYXNlc1twXTtcbiAgICAgICAgICAgICAgfnAuaW5kZXhPZihcIixcIikgJiYgKHAgPSBwLnNwbGl0KFwiLFwiKVswXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXNUcmFuc2Zvcm1SZWxhdGVkID0gcCBpbiBfdHJhbnNmb3JtUHJvcHM7XG5cbiAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1SZWxhdGVkKSB7XG4gICAgICAgICAgICBpZiAoIXRyYW5zZm9ybVByb3BUd2Vlbikge1xuICAgICAgICAgICAgICBjYWNoZSA9IHRhcmdldC5fZ3NhcDtcbiAgICAgICAgICAgICAgY2FjaGUucmVuZGVyVHJhbnNmb3JtICYmICF2YXJzLnBhcnNlVHJhbnNmb3JtIHx8IF9wYXJzZVRyYW5zZm9ybSh0YXJnZXQsIHZhcnMucGFyc2VUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICBzbW9vdGggPSB2YXJzLnNtb290aE9yaWdpbiAhPT0gZmFsc2UgJiYgY2FjaGUuc21vb3RoO1xuICAgICAgICAgICAgICB0cmFuc2Zvcm1Qcm9wVHdlZW4gPSB0aGlzLl9wdCA9IG5ldyBQcm9wVHdlZW4odGhpcy5fcHQsIHN0eWxlLCBfdHJhbnNmb3JtUHJvcCwgMCwgMSwgY2FjaGUucmVuZGVyVHJhbnNmb3JtLCBjYWNoZSwgMCwgLTEpO1xuICAgICAgICAgICAgICB0cmFuc2Zvcm1Qcm9wVHdlZW4uZGVwID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHAgPT09IFwic2NhbGVcIikge1xuICAgICAgICAgICAgICB0aGlzLl9wdCA9IG5ldyBQcm9wVHdlZW4odGhpcy5fcHQsIGNhY2hlLCBcInNjYWxlWVwiLCBjYWNoZS5zY2FsZVksIChyZWxhdGl2ZSA/IHJlbGF0aXZlICogZW5kTnVtIDogZW5kTnVtIC0gY2FjaGUuc2NhbGVZKSB8fCAwKTtcbiAgICAgICAgICAgICAgcHJvcHMucHVzaChcInNjYWxlWVwiLCBwKTtcbiAgICAgICAgICAgICAgcCArPSBcIlhcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCA9PT0gXCJ0cmFuc2Zvcm1PcmlnaW5cIikge1xuICAgICAgICAgICAgICBlbmRWYWx1ZSA9IF9jb252ZXJ0S2V5d29yZHNUb1BlcmNlbnRhZ2VzKGVuZFZhbHVlKTtcblxuICAgICAgICAgICAgICBpZiAoY2FjaGUuc3ZnKSB7XG4gICAgICAgICAgICAgICAgX2FwcGx5U1ZHT3JpZ2luKHRhcmdldCwgZW5kVmFsdWUsIDAsIHNtb290aCwgMCwgdGhpcyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW5kVW5pdCA9IHBhcnNlRmxvYXQoZW5kVmFsdWUuc3BsaXQoXCIgXCIpWzJdKSB8fCAwO1xuICAgICAgICAgICAgICAgIGVuZFVuaXQgIT09IGNhY2hlLnpPcmlnaW4gJiYgX2FkZE5vblR3ZWVuaW5nUFQodGhpcywgY2FjaGUsIFwiek9yaWdpblwiLCBjYWNoZS56T3JpZ2luLCBlbmRVbml0KTtcblxuICAgICAgICAgICAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHRoaXMsIHN0eWxlLCBwLCBfZmlyc3RUd29Pbmx5KHN0YXJ0VmFsdWUpLCBfZmlyc3RUd29Pbmx5KGVuZFZhbHVlKSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCA9PT0gXCJzdmdPcmlnaW5cIikge1xuICAgICAgICAgICAgICBfYXBwbHlTVkdPcmlnaW4odGFyZ2V0LCBlbmRWYWx1ZSwgMSwgc21vb3RoLCAwLCB0aGlzKTtcblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCBpbiBfcm90YXRpb25hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgX2FkZFJvdGF0aW9uYWxQcm9wVHdlZW4odGhpcywgY2FjaGUsIHAsIHN0YXJ0TnVtLCBlbmRWYWx1ZSwgcmVsYXRpdmUpO1xuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwID09PSBcInNtb290aE9yaWdpblwiKSB7XG4gICAgICAgICAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHRoaXMsIGNhY2hlLCBcInNtb290aFwiLCBjYWNoZS5zbW9vdGgsIGVuZFZhbHVlKTtcblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCA9PT0gXCJmb3JjZTNEXCIpIHtcbiAgICAgICAgICAgICAgY2FjaGVbcF0gPSBlbmRWYWx1ZTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAgPT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgICAgX2FkZFJhd1RyYW5zZm9ybVBUcyh0aGlzLCBlbmRWYWx1ZSwgdGFyZ2V0KTtcblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCEocCBpbiBzdHlsZSkpIHtcbiAgICAgICAgICAgIHAgPSBfY2hlY2tQcm9wUHJlZml4KHApIHx8IHA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzVHJhbnNmb3JtUmVsYXRlZCB8fCAoZW5kTnVtIHx8IGVuZE51bSA9PT0gMCkgJiYgKHN0YXJ0TnVtIHx8IHN0YXJ0TnVtID09PSAwKSAmJiAhX2NvbXBsZXhFeHAudGVzdChlbmRWYWx1ZSkgJiYgcCBpbiBzdHlsZSkge1xuICAgICAgICAgICAgc3RhcnRVbml0ID0gKHN0YXJ0VmFsdWUgKyBcIlwiKS5zdWJzdHIoKHN0YXJ0TnVtICsgXCJcIikubGVuZ3RoKTtcbiAgICAgICAgICAgIGVuZE51bSB8fCAoZW5kTnVtID0gMCk7XG4gICAgICAgICAgICBlbmRVbml0ID0gZ2V0VW5pdChlbmRWYWx1ZSkgfHwgKHAgaW4gX2NvbmZpZy51bml0cyA/IF9jb25maWcudW5pdHNbcF0gOiBzdGFydFVuaXQpO1xuICAgICAgICAgICAgc3RhcnRVbml0ICE9PSBlbmRVbml0ICYmIChzdGFydE51bSA9IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgcCwgc3RhcnRWYWx1ZSwgZW5kVW5pdCkpO1xuICAgICAgICAgICAgdGhpcy5fcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCBpc1RyYW5zZm9ybVJlbGF0ZWQgPyBjYWNoZSA6IHN0eWxlLCBwLCBzdGFydE51bSwgcmVsYXRpdmUgPyByZWxhdGl2ZSAqIGVuZE51bSA6IGVuZE51bSAtIHN0YXJ0TnVtLCAhaXNUcmFuc2Zvcm1SZWxhdGVkICYmIChlbmRVbml0ID09PSBcInB4XCIgfHwgcCA9PT0gXCJ6SW5kZXhcIikgJiYgdmFycy5hdXRvUm91bmQgIT09IGZhbHNlID8gX3JlbmRlclJvdW5kZWRDU1NQcm9wIDogX3JlbmRlckNTU1Byb3ApO1xuICAgICAgICAgICAgdGhpcy5fcHQudSA9IGVuZFVuaXQgfHwgMDtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0VW5pdCAhPT0gZW5kVW5pdCAmJiBlbmRVbml0ICE9PSBcIiVcIikge1xuICAgICAgICAgICAgICB0aGlzLl9wdC5iID0gc3RhcnRWYWx1ZTtcbiAgICAgICAgICAgICAgdGhpcy5fcHQuciA9IF9yZW5kZXJDU1NQcm9wV2l0aEJlZ2lubmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCEocCBpbiBzdHlsZSkpIHtcbiAgICAgICAgICAgIGlmIChwIGluIHRhcmdldCkge1xuICAgICAgICAgICAgICB0aGlzLmFkZCh0YXJnZXQsIHAsIHN0YXJ0VmFsdWUgfHwgdGFyZ2V0W3BdLCBlbmRWYWx1ZSwgaW5kZXgsIHRhcmdldHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX21pc3NpbmdQbHVnaW4ocCwgZW5kVmFsdWUpO1xuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfdHdlZW5Db21wbGV4Q1NTU3RyaW5nLmNhbGwodGhpcywgdGFyZ2V0LCBwLCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJvcHMucHVzaChwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBoYXNQcmlvcml0eSAmJiBfc29ydFByb3BUd2VlbnNCeVByaW9yaXR5KHRoaXMpO1xuICAgIH0sXG4gICAgZ2V0OiBfZ2V0LFxuICAgIGFsaWFzZXM6IF9wcm9wZXJ0eUFsaWFzZXMsXG4gICAgZ2V0U2V0dGVyOiBmdW5jdGlvbiBnZXRTZXR0ZXIodGFyZ2V0LCBwcm9wZXJ0eSwgcGx1Z2luKSB7XG4gICAgICB2YXIgcCA9IF9wcm9wZXJ0eUFsaWFzZXNbcHJvcGVydHldO1xuICAgICAgcCAmJiBwLmluZGV4T2YoXCIsXCIpIDwgMCAmJiAocHJvcGVydHkgPSBwKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eSBpbiBfdHJhbnNmb3JtUHJvcHMgJiYgcHJvcGVydHkgIT09IF90cmFuc2Zvcm1PcmlnaW5Qcm9wICYmICh0YXJnZXQuX2dzYXAueCB8fCBfZ2V0KHRhcmdldCwgXCJ4XCIpKSA/IHBsdWdpbiAmJiBfcmVjZW50U2V0dGVyUGx1Z2luID09PSBwbHVnaW4gPyBwcm9wZXJ0eSA9PT0gXCJzY2FsZVwiID8gX3NldHRlclNjYWxlIDogX3NldHRlclRyYW5zZm9ybSA6IChfcmVjZW50U2V0dGVyUGx1Z2luID0gcGx1Z2luIHx8IHt9KSAmJiAocHJvcGVydHkgPT09IFwic2NhbGVcIiA/IF9zZXR0ZXJTY2FsZVdpdGhSZW5kZXIgOiBfc2V0dGVyVHJhbnNmb3JtV2l0aFJlbmRlcikgOiB0YXJnZXQuc3R5bGUgJiYgIV9pc1VuZGVmaW5lZCh0YXJnZXQuc3R5bGVbcHJvcGVydHldKSA/IF9zZXR0ZXJDU1NTdHlsZSA6IH5wcm9wZXJ0eS5pbmRleE9mKFwiLVwiKSA/IF9zZXR0ZXJDU1NQcm9wIDogX2dldFNldHRlcih0YXJnZXQsIHByb3BlcnR5KTtcbiAgICB9LFxuICAgIGNvcmU6IHtcbiAgICAgIF9yZW1vdmVQcm9wZXJ0eTogX3JlbW92ZVByb3BlcnR5LFxuICAgICAgX2dldE1hdHJpeDogX2dldE1hdHJpeFxuICAgIH1cbiAgfTtcbiAgZ3NhcC51dGlscy5jaGVja1ByZWZpeCA9IF9jaGVja1Byb3BQcmVmaXg7XG5cbiAgKGZ1bmN0aW9uIChwb3NpdGlvbkFuZFNjYWxlLCByb3RhdGlvbiwgb3RoZXJzLCBhbGlhc2VzKSB7XG4gICAgdmFyIGFsbCA9IF9mb3JFYWNoTmFtZShwb3NpdGlvbkFuZFNjYWxlICsgXCIsXCIgKyByb3RhdGlvbiArIFwiLFwiICsgb3RoZXJzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgX3RyYW5zZm9ybVByb3BzW25hbWVdID0gMTtcbiAgICB9KTtcblxuICAgIF9mb3JFYWNoTmFtZShyb3RhdGlvbiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIF9jb25maWcudW5pdHNbbmFtZV0gPSBcImRlZ1wiO1xuICAgICAgX3JvdGF0aW9uYWxQcm9wZXJ0aWVzW25hbWVdID0gMTtcbiAgICB9KTtcblxuICAgIF9wcm9wZXJ0eUFsaWFzZXNbYWxsWzEzXV0gPSBwb3NpdGlvbkFuZFNjYWxlICsgXCIsXCIgKyByb3RhdGlvbjtcblxuICAgIF9mb3JFYWNoTmFtZShhbGlhc2VzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIHNwbGl0ID0gbmFtZS5zcGxpdChcIjpcIik7XG4gICAgICBfcHJvcGVydHlBbGlhc2VzW3NwbGl0WzFdXSA9IGFsbFtzcGxpdFswXV07XG4gICAgfSk7XG4gIH0pKFwieCx5LHosc2NhbGUsc2NhbGVYLHNjYWxlWSx4UGVyY2VudCx5UGVyY2VudFwiLCBcInJvdGF0aW9uLHJvdGF0aW9uWCxyb3RhdGlvblksc2tld1gsc2tld1lcIiwgXCJ0cmFuc2Zvcm0sdHJhbnNmb3JtT3JpZ2luLHN2Z09yaWdpbixmb3JjZTNELHNtb290aE9yaWdpbix0cmFuc2Zvcm1QZXJzcGVjdGl2ZVwiLCBcIjA6dHJhbnNsYXRlWCwxOnRyYW5zbGF0ZVksMjp0cmFuc2xhdGVaLDg6cm90YXRlLDg6cm90YXRpb25aLDg6cm90YXRlWiw5OnJvdGF0ZVgsMTA6cm90YXRlWVwiKTtcblxuICBfZm9yRWFjaE5hbWUoXCJ4LHkseix0b3AscmlnaHQsYm90dG9tLGxlZnQsd2lkdGgsaGVpZ2h0LGZvbnRTaXplLHBhZGRpbmcsbWFyZ2luLHBlcnNwZWN0aXZlXCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgX2NvbmZpZy51bml0c1tuYW1lXSA9IFwicHhcIjtcbiAgfSk7XG5cbiAgZ3NhcC5yZWdpc3RlclBsdWdpbihDU1NQbHVnaW4pO1xuXG4gIHZhciBnc2FwV2l0aENTUyA9IGdzYXAucmVnaXN0ZXJQbHVnaW4oQ1NTUGx1Z2luKSB8fCBnc2FwLFxuICAgICAgVHdlZW5NYXhXaXRoQ1NTID0gZ3NhcFdpdGhDU1MuY29yZS5Ud2VlbjtcblxuICBleHBvcnRzLkJhY2sgPSBCYWNrO1xuICBleHBvcnRzLkJvdW5jZSA9IEJvdW5jZTtcbiAgZXhwb3J0cy5DU1NQbHVnaW4gPSBDU1NQbHVnaW47XG4gIGV4cG9ydHMuQ2lyYyA9IENpcmM7XG4gIGV4cG9ydHMuQ3ViaWMgPSBDdWJpYztcbiAgZXhwb3J0cy5FbGFzdGljID0gRWxhc3RpYztcbiAgZXhwb3J0cy5FeHBvID0gRXhwbztcbiAgZXhwb3J0cy5MaW5lYXIgPSBMaW5lYXI7XG4gIGV4cG9ydHMuUG93ZXIwID0gUG93ZXIwO1xuICBleHBvcnRzLlBvd2VyMSA9IFBvd2VyMTtcbiAgZXhwb3J0cy5Qb3dlcjIgPSBQb3dlcjI7XG4gIGV4cG9ydHMuUG93ZXIzID0gUG93ZXIzO1xuICBleHBvcnRzLlBvd2VyNCA9IFBvd2VyNDtcbiAgZXhwb3J0cy5RdWFkID0gUXVhZDtcbiAgZXhwb3J0cy5RdWFydCA9IFF1YXJ0O1xuICBleHBvcnRzLlF1aW50ID0gUXVpbnQ7XG4gIGV4cG9ydHMuU2luZSA9IFNpbmU7XG4gIGV4cG9ydHMuU3RlcHBlZEVhc2UgPSBTdGVwcGVkRWFzZTtcbiAgZXhwb3J0cy5TdHJvbmcgPSBTdHJvbmc7XG4gIGV4cG9ydHMuVGltZWxpbmVMaXRlID0gVGltZWxpbmU7XG4gIGV4cG9ydHMuVGltZWxpbmVNYXggPSBUaW1lbGluZTtcbiAgZXhwb3J0cy5Ud2VlbkxpdGUgPSBUd2VlbjtcbiAgZXhwb3J0cy5Ud2Vlbk1heCA9IFR3ZWVuTWF4V2l0aENTUztcbiAgZXhwb3J0cy5kZWZhdWx0ID0gZ3NhcFdpdGhDU1M7XG4gIGV4cG9ydHMuZ3NhcCA9IGdzYXBXaXRoQ1NTO1xuXG4gIGlmICh0eXBlb2Yod2luZG93KSA9PT0gJ3VuZGVmaW5lZCcgfHwgd2luZG93ICE9PSBleHBvcnRzKSB7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTt9IGVsc2Uge2RlbGV0ZSB3aW5kb3cuZGVmYXVsdDt9XG5cbn0pKSk7XG4iLCJmdW5jdGlvbiBpbml0TGF6eWxvYWQoKSB7XG4gIGNvbnN0IGltZ09ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzLCBzZWxmKSA9PiB7XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICBsYXp5TG9hZChlbnRyeS50YXJnZXQpO1xuICAgICAgICBzZWxmLnVub2JzZXJ2ZShlbnRyeS50YXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxhenktcGljdHVyZScpLmZvckVhY2goKHBpY3R1cmUpID0+IHtcbiAgICBpbWdPYnNlcnZlci5vYnNlcnZlKHBpY3R1cmUpO1xuICB9KTtcblxuICBjb25zdCBsYXp5TG9hZCA9IChwaWN0dXJlKSA9PiB7XG4gICAgY29uc3QgaW1nID0gcGljdHVyZS5xdWVyeVNlbGVjdG9yKCdpbWcnKSB8fCBwaWN0dXJlO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBwaWN0dXJlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NvdXJjZScpO1xuICBcbiAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgc291cmNlLnNyY3NldCA9IHNvdXJjZS5kYXRhc2V0LnNyY3NldDtcbiAgICAgIHNvdXJjZS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc3Jjc2V0Jyk7XG4gICAgfSk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLnNyYyA9IGltZy5kYXRhc2V0LnNyYztcbiAgICAgIGltZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc3JjJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXRMYXp5bG9hZDsiLCJpbXBvcnQge2dzYXB9IGZyb20gJ2dzYXAnO1xuaW1wb3J0IHsgU2Nyb2xsVHJpZ2dlciB9IGZyb20gXCJnc2FwL2Rpc3QvU2Nyb2xsVHJpZ2dlclwiO1xuXG5nc2FwLnJlZ2lzdGVyUGx1Z2luKFNjcm9sbFRyaWdnZXIpO1xuXG5mdW5jdGlvbiBpbml0UGFyYWxsYXhBbmltYXRpb25zKCkge1xuICAgIGNvbnN0IGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXBhcmFsbGF4PVwidHJ1ZVwiXScpLFxuICAgICAgICBtdWx0aXBsaWVyID0gMjAsXG4gICAgICAgIGJyZWFrcG9pbnREZXNrdG9wID0gMTQ0MDtcblxuICAgIGVscy5mb3JFYWNoKChlbCwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgZWxUbCA9IGdzYXAudGltZWxpbmUoKTtcblxuICAgICAgICAvLyBjb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBib2R5LmNsaWVudFdpZHRoO1xuICAgICAgICBlbFRsLnRvKGVsLCB7XG4gICAgICAgICAgICB5UGVyY2VudDogaW5kZXggKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiBtdWx0aXBsaWVyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIFNjcm9sbFRyaWdnZXIuY3JlYXRlKHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogZWxUbCxcbiAgICAgICAgICAgIHRyaWdnZXI6IGVsLFxuICAgICAgICAgICAgc3RhcnQ6ICd0b3AgYm90dG9tJyxcbiAgICAgICAgICAgIHNjcnViOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpbml0UGFyYWxsYXhBbmltYXRpb25zOyIsImZ1bmN0aW9uIHNjcm9sbFRvU2VjdGlvbigpIHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNjcm9sbC10bycpO1xuXG4gIGlmIChidG4pIHtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtaHJlZicpKTtcblxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgd2luZG93LnNjcm9sbFk7XG5cbiAgICAgICAgd2luZG93LnNjcm9sbFRvKHtcbiAgICAgICAgICB0b3A6IG9mZnNldCxcbiAgICAgICAgICBiZWhhdmlvdXI6ICdzbW9vdGgnXG4gICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBzY3JvbGxUb1NlY3Rpb247IiwiaW1wb3J0IGluaXRMYXp5TG9hZCBmcm9tICcuL2NvbXBvbmVudHMvbGF6eWxvYWQnO1xuaW1wb3J0IHNjcm9sbFRvU2VjdGlvbiBmcm9tICcuL2NvbXBvbmVudHMvc2Nyb2xsVG9TZWN0aW9uJztcbmltcG9ydCBpbml0UGFyYWxsYXhBbmltYXRpb25zIGZyb20gJy4vY29tcG9uZW50cy9wYXJhbGxheEFuaW1hdGlvbnMnO1xuLy8gaW1wb3J0IGluaXRTcGxpdHRpbmcgZnJvbSAnLi9jb21wb25lbnRzL3NwbGl0dGluZyc7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgIC8vIGNvbnNvbGUud2FybignbG9hZGVkJyk7XG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBpbml0TGF6eUxvYWQoKTtcbiAgICBzY3JvbGxUb1NlY3Rpb24oKTtcbiAgICBpbml0UGFyYWxsYXhBbmltYXRpb25zKCk7XG4gICAgLy8gaW5pdFNwbGl0dGluZygpO1xufSk7Il19
