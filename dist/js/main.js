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

function initHeader() {
  var header = document.querySelector('#header');
  var prev_scroll_position = 0;
  var last_known_scroll_position = 0;
  var ticking = false;
  var offset = 80;

  function toggleHeader(last_scroll_pos, prev_scroll_pos) {
    if (!header.classList.contains('header--freezed')) {
      if (last_scroll_pos > prev_scroll_pos) {
        // scrolled down
        header.classList.add('header--collapsed');
      } else {
        // scrolled up
        header.classList.remove('header--collapsed');
      }

      prev_scroll_position = last_known_scroll_position;

      if (last_known_scroll_position < offset) {
        header.classList.add('header--transparent');
      } else {
        header.classList.remove('header--transparent');
      }
    }
  }

  window.addEventListener('scroll', function (ev) {
    last_known_scroll_position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function () {
        toggleHeader(last_known_scroll_position, prev_scroll_position);
        ticking = false;
      });
      ticking = true;
    }
  });
}

var _default = initHeader;
exports["default"] = _default;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"gsap":2,"gsap/dist/ScrollTrigger":1}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

var _lazyload = _interopRequireDefault(require("./components/lazyload"));

var _scrollToSection = _interopRequireDefault(require("./components/scrollToSection"));

var _parallaxAnimations = _interopRequireDefault(require("./components/parallaxAnimations"));

var _header = _interopRequireDefault(require("./components/header"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import initSplitting from './components/splitting';
window.addEventListener('load', function () {// console.warn('loaded');
});
document.addEventListener('DOMContentLoaded', function () {
  (0, _lazyload["default"])();
  (0, _scrollToSection["default"])();
  (0, _parallaxAnimations["default"])();
  (0, _header["default"])(); // initSplitting();
});

},{"./components/header":3,"./components/lazyload":4,"./components/parallaxAnimations":5,"./components/scrollToSection":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZ3NhcC9kaXN0L1Njcm9sbFRyaWdnZXIuanMiLCJub2RlX21vZHVsZXMvZ3NhcC9kaXN0L2dzYXAuanMiLCJzcmMvanMvY29tcG9uZW50cy9oZWFkZXIuanMiLCJzcmMvanMvY29tcG9uZW50cy9sYXp5bG9hZC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3BhcmFsbGF4QW5pbWF0aW9ucy5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Njcm9sbFRvU2VjdGlvbi5qcyIsInNyYy9qcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcDBEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNoNUpBLFNBQVMsVUFBVCxHQUFzQjtBQUNsQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QixDQUFmO0FBRUEsTUFBSSxvQkFBb0IsR0FBRyxDQUEzQjtBQUNBLE1BQUksMEJBQTBCLEdBQUcsQ0FBakM7QUFDQSxNQUFJLE9BQU8sR0FBRyxLQUFkO0FBQ0EsTUFBTSxNQUFNLEdBQUcsRUFBZjs7QUFFQSxXQUFTLFlBQVQsQ0FBc0IsZUFBdEIsRUFBdUMsZUFBdkMsRUFBd0Q7QUFDcEQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLGlCQUExQixDQUFMLEVBQW1EO0FBQy9DLFVBQUksZUFBZSxHQUFHLGVBQXRCLEVBQXVDO0FBQ25DO0FBQ0EsUUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixHQUFqQixDQUFxQixtQkFBckI7QUFDSCxPQUhELE1BR087QUFDSDtBQUNBLFFBQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsbUJBQXhCO0FBQ0g7O0FBQ0QsTUFBQSxvQkFBb0IsR0FBRywwQkFBdkI7O0FBQ0EsVUFBSSwwQkFBMEIsR0FBRyxNQUFqQyxFQUF5QztBQUNyQyxRQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEdBQWpCLENBQXFCLHFCQUFyQjtBQUNILE9BRkQsTUFFTztBQUNILFFBQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IscUJBQXhCO0FBQ0g7QUFDSjtBQUNKOztBQUVELEVBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFVBQUMsRUFBRCxFQUFRO0FBQ3RDLElBQUEsMEJBQTBCLEdBQUcsTUFBTSxDQUFDLE9BQXBDOztBQUVBLFFBQUksQ0FBQyxPQUFMLEVBQWM7QUFDVixNQUFBLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixZQUFXO0FBQ3BDLFFBQUEsWUFBWSxDQUFDLDBCQUFELEVBQTZCLG9CQUE3QixDQUFaO0FBQ0EsUUFBQSxPQUFPLEdBQUcsS0FBVjtBQUNILE9BSEQ7QUFLQSxNQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7QUFDSixHQVhEO0FBWUg7O2VBRWMsVTs7Ozs7Ozs7Ozs7QUN4Q2YsU0FBUyxZQUFULEdBQXdCO0FBQ3RCLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUosQ0FBeUIsVUFBQyxPQUFELEVBQVUsSUFBVixFQUFtQjtBQUM5RCxJQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQUEsS0FBSyxFQUFJO0FBQ3ZCLFVBQUksS0FBSyxDQUFDLGNBQVYsRUFBMEI7QUFDeEIsUUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQVAsQ0FBUjtBQUNBLFFBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFLLENBQUMsTUFBckI7QUFDRDtBQUNGLEtBTEQ7QUFNRCxHQVBtQixDQUFwQjtBQVFBLEVBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLE9BQTNDLENBQW1ELFVBQUMsT0FBRCxFQUFhO0FBQzlELElBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsT0FBcEI7QUFDRCxHQUZEOztBQUlBLE1BQU0sUUFBUSxHQUFHLFNBQVgsUUFBVyxDQUFDLE9BQUQsRUFBYTtBQUM1QixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBUixDQUFzQixLQUF0QixLQUFnQyxPQUE1QztBQUNBLFFBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixRQUF6QixDQUFoQjtBQUVBLElBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBQyxNQUFELEVBQVk7QUFDMUIsTUFBQSxNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUMsT0FBUCxDQUFlLE1BQS9CO0FBQ0EsTUFBQSxNQUFNLENBQUMsZUFBUCxDQUF1QixhQUF2QjtBQUNELEtBSEQ7O0FBSUEsUUFBSSxHQUFKLEVBQVM7QUFDUCxNQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUF0QjtBQUNBLE1BQUEsR0FBRyxDQUFDLGVBQUosQ0FBb0IsVUFBcEI7QUFDRDtBQUNGLEdBWkQ7QUFhRDs7ZUFFYyxZOzs7Ozs7Ozs7OztBQzVCZjs7QUFDQTs7QUFFQSxXQUFLLGNBQUwsQ0FBb0IsNEJBQXBCOztBQUVBLFNBQVMsc0JBQVQsR0FBa0M7QUFDOUIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGdCQUFULENBQTBCLHdCQUExQixDQUFaO0FBQUEsTUFDSSxVQUFVLEdBQUcsRUFEakI7QUFBQSxNQUVJLGlCQUFpQixHQUFHLElBRnhCO0FBSUEsRUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLFVBQUMsRUFBRCxFQUFLLEtBQUwsRUFBZTtBQUN2QixRQUFNLElBQUksR0FBRyxXQUFLLFFBQUwsRUFBYixDQUR1QixDQUd2Qjs7O0FBQ0EsSUFBQSxJQUFJLENBQUMsRUFBTCxDQUFRLEVBQVIsRUFBWTtBQUNSLE1BQUEsUUFBUSxFQUFFLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTCxLQUFnQixHQUFwQixDQUFMLEdBQWdDO0FBRGxDLEtBQVo7O0FBSUEsaUNBQWMsTUFBZCxDQUFxQjtBQUNqQixNQUFBLFNBQVMsRUFBRSxJQURNO0FBRWpCLE1BQUEsT0FBTyxFQUFFLEVBRlE7QUFHakIsTUFBQSxLQUFLLEVBQUUsWUFIVTtBQUlqQixNQUFBLEtBQUssRUFBRTtBQUpVLEtBQXJCO0FBTUgsR0FkRDtBQWVIOztlQUVjLHNCOzs7Ozs7Ozs7OztBQzNCZixTQUFTLGVBQVQsR0FBMkI7QUFDekIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZUFBdkIsQ0FBWjs7QUFFQSxNQUFJLEdBQUosRUFBUztBQUNQLElBQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLFlBQU07QUFDbEMsVUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBRyxDQUFDLFlBQUosQ0FBaUIsV0FBakIsQ0FBdkIsQ0FBZjs7QUFFQSxVQUFJLE1BQUosRUFBWTtBQUNWLFlBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxxQkFBUCxHQUErQixHQUEvQixHQUFxQyxNQUFNLENBQUMsT0FBM0Q7QUFFQSxRQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCO0FBQ2QsVUFBQSxHQUFHLEVBQUUsTUFEUztBQUVkLFVBQUEsU0FBUyxFQUFFO0FBRkcsU0FBaEI7QUFJRDtBQUNGLEtBWEQ7QUFZRDtBQUNGOztlQUVjLGU7Ozs7OztBQ25CZjs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBO0FBRUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU0sQ0FDbEM7QUFDSCxDQUZEO0FBSUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLDRCQUpnRCxDQUtoRDtBQUNILENBTkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG5cdChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwud2luZG93ID0gZ2xvYmFsLndpbmRvdyB8fCB7fSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG5cdC8qIVxuXHQgKiBTY3JvbGxUcmlnZ2VyIDMuOS4xXG5cdCAqIGh0dHBzOi8vZ3JlZW5zb2NrLmNvbVxuXHQgKlxuXHQgKiBAbGljZW5zZSBDb3B5cmlnaHQgMjAwOC0yMDIxLCBHcmVlblNvY2suIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cdCAqIFN1YmplY3QgdG8gdGhlIHRlcm1zIGF0IGh0dHBzOi8vZ3JlZW5zb2NrLmNvbS9zdGFuZGFyZC1saWNlbnNlIG9yIGZvclxuXHQgKiBDbHViIEdyZWVuU29jayBtZW1iZXJzLCB0aGUgYWdyZWVtZW50IGlzc3VlZCB3aXRoIHRoYXQgbWVtYmVyc2hpcC5cblx0ICogQGF1dGhvcjogSmFjayBEb3lsZSwgamFja0BncmVlbnNvY2suY29tXG5cdCovXG5cdHZhciBnc2FwLFxuXHQgICAgX2NvcmVJbml0dGVkLFxuXHQgICAgX3dpbixcblx0ICAgIF9kb2MsXG5cdCAgICBfZG9jRWwsXG5cdCAgICBfYm9keSxcblx0ICAgIF9yb290LFxuXHQgICAgX3Jlc2l6ZURlbGF5LFxuXHQgICAgX3RvQXJyYXksXG5cdCAgICBfY2xhbXAsXG5cdCAgICBfdGltZTIsXG5cdCAgICBfc3luY0ludGVydmFsLFxuXHQgICAgX3JlZnJlc2hpbmcsXG5cdCAgICBfcG9pbnRlcklzRG93bixcblx0ICAgIF90cmFuc2Zvcm1Qcm9wLFxuXHQgICAgX2ksXG5cdCAgICBfcHJldldpZHRoLFxuXHQgICAgX3ByZXZIZWlnaHQsXG5cdCAgICBfYXV0b1JlZnJlc2gsXG5cdCAgICBfc29ydCxcblx0ICAgIF9zdXBwcmVzc092ZXJ3cml0ZXMsXG5cdCAgICBfaWdub3JlUmVzaXplLFxuXHQgICAgX2xpbWl0Q2FsbGJhY2tzLFxuXHQgICAgX3N0YXJ0dXAgPSAxLFxuXHQgICAgX3Byb3hpZXMgPSBbXSxcblx0ICAgIF9zY3JvbGxlcnMgPSBbXSxcblx0ICAgIF9nZXRUaW1lID0gRGF0ZS5ub3csXG5cdCAgICBfdGltZTEgPSBfZ2V0VGltZSgpLFxuXHQgICAgX2xhc3RTY3JvbGxUaW1lID0gMCxcblx0ICAgIF9lbmFibGVkID0gMSxcblx0ICAgIF9wYXNzVGhyb3VnaCA9IGZ1bmN0aW9uIF9wYXNzVGhyb3VnaCh2KSB7XG5cdCAgcmV0dXJuIHY7XG5cdH0sXG5cdCAgICBfZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gX2dldFRhcmdldCh0KSB7XG5cdCAgcmV0dXJuIF90b0FycmF5KHQpWzBdIHx8IChfaXNTdHJpbmcodCkgJiYgZ3NhcC5jb25maWcoKS5udWxsVGFyZ2V0V2FybiAhPT0gZmFsc2UgPyBjb25zb2xlLndhcm4oXCJFbGVtZW50IG5vdCBmb3VuZDpcIiwgdCkgOiBudWxsKTtcblx0fSxcblx0ICAgIF9yb3VuZCA9IGZ1bmN0aW9uIF9yb3VuZCh2YWx1ZSkge1xuXHQgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogMTAwMDAwKSAvIDEwMDAwMCB8fCAwO1xuXHR9LFxuXHQgICAgX3dpbmRvd0V4aXN0cyA9IGZ1bmN0aW9uIF93aW5kb3dFeGlzdHMoKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI7XG5cdH0sXG5cdCAgICBfZ2V0R1NBUCA9IGZ1bmN0aW9uIF9nZXRHU0FQKCkge1xuXHQgIHJldHVybiBnc2FwIHx8IF93aW5kb3dFeGlzdHMoKSAmJiAoZ3NhcCA9IHdpbmRvdy5nc2FwKSAmJiBnc2FwLnJlZ2lzdGVyUGx1Z2luICYmIGdzYXA7XG5cdH0sXG5cdCAgICBfaXNWaWV3cG9ydCA9IGZ1bmN0aW9uIF9pc1ZpZXdwb3J0KGUpIHtcblx0ICByZXR1cm4gISF+X3Jvb3QuaW5kZXhPZihlKTtcblx0fSxcblx0ICAgIF9nZXRQcm94eVByb3AgPSBmdW5jdGlvbiBfZ2V0UHJveHlQcm9wKGVsZW1lbnQsIHByb3BlcnR5KSB7XG5cdCAgcmV0dXJuIH5fcHJveGllcy5pbmRleE9mKGVsZW1lbnQpICYmIF9wcm94aWVzW19wcm94aWVzLmluZGV4T2YoZWxlbWVudCkgKyAxXVtwcm9wZXJ0eV07XG5cdH0sXG5cdCAgICBfZ2V0U2Nyb2xsRnVuYyA9IGZ1bmN0aW9uIF9nZXRTY3JvbGxGdW5jKGVsZW1lbnQsIF9yZWYpIHtcblx0ICB2YXIgcyA9IF9yZWYucyxcblx0ICAgICAgc2MgPSBfcmVmLnNjO1xuXG5cdCAgdmFyIGkgPSBfc2Nyb2xsZXJzLmluZGV4T2YoZWxlbWVudCksXG5cdCAgICAgIG9mZnNldCA9IHNjID09PSBfdmVydGljYWwuc2MgPyAxIDogMjtcblxuXHQgICF+aSAmJiAoaSA9IF9zY3JvbGxlcnMucHVzaChlbGVtZW50KSAtIDEpO1xuXHQgIHJldHVybiBfc2Nyb2xsZXJzW2kgKyBvZmZzZXRdIHx8IChfc2Nyb2xsZXJzW2kgKyBvZmZzZXRdID0gX2dldFByb3h5UHJvcChlbGVtZW50LCBzKSB8fCAoX2lzVmlld3BvcnQoZWxlbWVudCkgPyBzYyA6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBlbGVtZW50W3NdID0gdmFsdWUgOiBlbGVtZW50W3NdO1xuXHQgIH0pKTtcblx0fSxcblx0ICAgIF9nZXRCb3VuZHNGdW5jID0gZnVuY3Rpb24gX2dldEJvdW5kc0Z1bmMoZWxlbWVudCkge1xuXHQgIHJldHVybiBfZ2V0UHJveHlQcm9wKGVsZW1lbnQsIFwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0XCIpIHx8IChfaXNWaWV3cG9ydChlbGVtZW50KSA/IGZ1bmN0aW9uICgpIHtcblx0ICAgIF93aW5PZmZzZXRzLndpZHRoID0gX3dpbi5pbm5lcldpZHRoO1xuXHQgICAgX3dpbk9mZnNldHMuaGVpZ2h0ID0gX3dpbi5pbm5lckhlaWdodDtcblx0ICAgIHJldHVybiBfd2luT2Zmc2V0cztcblx0ICB9IDogZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIF9nZXRCb3VuZHMoZWxlbWVudCk7XG5cdCAgfSk7XG5cdH0sXG5cdCAgICBfZ2V0U2l6ZUZ1bmMgPSBmdW5jdGlvbiBfZ2V0U2l6ZUZ1bmMoc2Nyb2xsZXIsIGlzVmlld3BvcnQsIF9yZWYyKSB7XG5cdCAgdmFyIGQgPSBfcmVmMi5kLFxuXHQgICAgICBkMiA9IF9yZWYyLmQyLFxuXHQgICAgICBhID0gX3JlZjIuYTtcblx0ICByZXR1cm4gKGEgPSBfZ2V0UHJveHlQcm9wKHNjcm9sbGVyLCBcImdldEJvdW5kaW5nQ2xpZW50UmVjdFwiKSkgPyBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gYSgpW2RdO1xuXHQgIH0gOiBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gKGlzVmlld3BvcnQgPyBfd2luW1wiaW5uZXJcIiArIGQyXSA6IHNjcm9sbGVyW1wiY2xpZW50XCIgKyBkMl0pIHx8IDA7XG5cdCAgfTtcblx0fSxcblx0ICAgIF9nZXRPZmZzZXRzRnVuYyA9IGZ1bmN0aW9uIF9nZXRPZmZzZXRzRnVuYyhlbGVtZW50LCBpc1ZpZXdwb3J0KSB7XG5cdCAgcmV0dXJuICFpc1ZpZXdwb3J0IHx8IH5fcHJveGllcy5pbmRleE9mKGVsZW1lbnQpID8gX2dldEJvdW5kc0Z1bmMoZWxlbWVudCkgOiBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gX3dpbk9mZnNldHM7XG5cdCAgfTtcblx0fSxcblx0ICAgIF9tYXhTY3JvbGwgPSBmdW5jdGlvbiBfbWF4U2Nyb2xsKGVsZW1lbnQsIF9yZWYzKSB7XG5cdCAgdmFyIHMgPSBfcmVmMy5zLFxuXHQgICAgICBkMiA9IF9yZWYzLmQyLFxuXHQgICAgICBkID0gX3JlZjMuZCxcblx0ICAgICAgYSA9IF9yZWYzLmE7XG5cdCAgcmV0dXJuIChzID0gXCJzY3JvbGxcIiArIGQyKSAmJiAoYSA9IF9nZXRQcm94eVByb3AoZWxlbWVudCwgcykpID8gYSgpIC0gX2dldEJvdW5kc0Z1bmMoZWxlbWVudCkoKVtkXSA6IF9pc1ZpZXdwb3J0KGVsZW1lbnQpID8gKF9ib2R5W3NdIHx8IF9kb2NFbFtzXSkgLSAoX3dpbltcImlubmVyXCIgKyBkMl0gfHwgX2RvY0VsW1wiY2xpZW50XCIgKyBkMl0gfHwgX2JvZHlbXCJjbGllbnRcIiArIGQyXSkgOiBlbGVtZW50W3NdIC0gZWxlbWVudFtcIm9mZnNldFwiICsgZDJdO1xuXHR9LFxuXHQgICAgX2l0ZXJhdGVBdXRvUmVmcmVzaCA9IGZ1bmN0aW9uIF9pdGVyYXRlQXV0b1JlZnJlc2goZnVuYywgZXZlbnRzKSB7XG5cdCAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYXV0b1JlZnJlc2gubGVuZ3RoOyBpICs9IDMpIHtcblx0ICAgICghZXZlbnRzIHx8IH5ldmVudHMuaW5kZXhPZihfYXV0b1JlZnJlc2hbaSArIDFdKSkgJiYgZnVuYyhfYXV0b1JlZnJlc2hbaV0sIF9hdXRvUmVmcmVzaFtpICsgMV0sIF9hdXRvUmVmcmVzaFtpICsgMl0pO1xuXHQgIH1cblx0fSxcblx0ICAgIF9pc1N0cmluZyA9IGZ1bmN0aW9uIF9pc1N0cmluZyh2YWx1ZSkge1xuXHQgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCI7XG5cdH0sXG5cdCAgICBfaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIF9pc0Z1bmN0aW9uKHZhbHVlKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiO1xuXHR9LFxuXHQgICAgX2lzTnVtYmVyID0gZnVuY3Rpb24gX2lzTnVtYmVyKHZhbHVlKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIjtcblx0fSxcblx0ICAgIF9pc09iamVjdCA9IGZ1bmN0aW9uIF9pc09iamVjdCh2YWx1ZSkge1xuXHQgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCI7XG5cdH0sXG5cdCAgICBfY2FsbElmRnVuYyA9IGZ1bmN0aW9uIF9jYWxsSWZGdW5jKHZhbHVlKSB7XG5cdCAgcmV0dXJuIF9pc0Z1bmN0aW9uKHZhbHVlKSAmJiB2YWx1ZSgpO1xuXHR9LFxuXHQgICAgX2NvbWJpbmVGdW5jID0gZnVuY3Rpb24gX2NvbWJpbmVGdW5jKGYxLCBmMikge1xuXHQgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICB2YXIgcmVzdWx0MSA9IF9jYWxsSWZGdW5jKGYxKSxcblx0ICAgICAgICByZXN1bHQyID0gX2NhbGxJZkZ1bmMoZjIpO1xuXG5cdCAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuXHQgICAgICBfY2FsbElmRnVuYyhyZXN1bHQxKTtcblxuXHQgICAgICBfY2FsbElmRnVuYyhyZXN1bHQyKTtcblx0ICAgIH07XG5cdCAgfTtcblx0fSxcblx0ICAgIF9lbmRBbmltYXRpb24gPSBmdW5jdGlvbiBfZW5kQW5pbWF0aW9uKGFuaW1hdGlvbiwgcmV2ZXJzZWQsIHBhdXNlKSB7XG5cdCAgcmV0dXJuIGFuaW1hdGlvbiAmJiBhbmltYXRpb24ucHJvZ3Jlc3MocmV2ZXJzZWQgPyAwIDogMSkgJiYgcGF1c2UgJiYgYW5pbWF0aW9uLnBhdXNlKCk7XG5cdH0sXG5cdCAgICBfY2FsbGJhY2sgPSBmdW5jdGlvbiBfY2FsbGJhY2soc2VsZiwgZnVuYykge1xuXHQgIGlmIChzZWxmLmVuYWJsZWQpIHtcblx0ICAgIHZhciByZXN1bHQgPSBmdW5jKHNlbGYpO1xuXHQgICAgcmVzdWx0ICYmIHJlc3VsdC50b3RhbFRpbWUgJiYgKHNlbGYuY2FsbGJhY2tBbmltYXRpb24gPSByZXN1bHQpO1xuXHQgIH1cblx0fSxcblx0ICAgIF9hYnMgPSBNYXRoLmFicyxcblx0ICAgIF9zY3JvbGxMZWZ0ID0gXCJzY3JvbGxMZWZ0XCIsXG5cdCAgICBfc2Nyb2xsVG9wID0gXCJzY3JvbGxUb3BcIixcblx0ICAgIF9sZWZ0ID0gXCJsZWZ0XCIsXG5cdCAgICBfdG9wID0gXCJ0b3BcIixcblx0ICAgIF9yaWdodCA9IFwicmlnaHRcIixcblx0ICAgIF9ib3R0b20gPSBcImJvdHRvbVwiLFxuXHQgICAgX3dpZHRoID0gXCJ3aWR0aFwiLFxuXHQgICAgX2hlaWdodCA9IFwiaGVpZ2h0XCIsXG5cdCAgICBfUmlnaHQgPSBcIlJpZ2h0XCIsXG5cdCAgICBfTGVmdCA9IFwiTGVmdFwiLFxuXHQgICAgX1RvcCA9IFwiVG9wXCIsXG5cdCAgICBfQm90dG9tID0gXCJCb3R0b21cIixcblx0ICAgIF9wYWRkaW5nID0gXCJwYWRkaW5nXCIsXG5cdCAgICBfbWFyZ2luID0gXCJtYXJnaW5cIixcblx0ICAgIF9XaWR0aCA9IFwiV2lkdGhcIixcblx0ICAgIF9IZWlnaHQgPSBcIkhlaWdodFwiLFxuXHQgICAgX3B4ID0gXCJweFwiLFxuXHQgICAgX2hvcml6b250YWwgPSB7XG5cdCAgczogX3Njcm9sbExlZnQsXG5cdCAgcDogX2xlZnQsXG5cdCAgcDI6IF9MZWZ0LFxuXHQgIG9zOiBfcmlnaHQsXG5cdCAgb3MyOiBfUmlnaHQsXG5cdCAgZDogX3dpZHRoLFxuXHQgIGQyOiBfV2lkdGgsXG5cdCAgYTogXCJ4XCIsXG5cdCAgc2M6IGZ1bmN0aW9uIHNjKHZhbHVlKSB7XG5cdCAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IF93aW4uc2Nyb2xsVG8odmFsdWUsIF92ZXJ0aWNhbC5zYygpKSA6IF93aW4ucGFnZVhPZmZzZXQgfHwgX2RvY1tfc2Nyb2xsTGVmdF0gfHwgX2RvY0VsW19zY3JvbGxMZWZ0XSB8fCBfYm9keVtfc2Nyb2xsTGVmdF0gfHwgMDtcblx0ICB9XG5cdH0sXG5cdCAgICBfdmVydGljYWwgPSB7XG5cdCAgczogX3Njcm9sbFRvcCxcblx0ICBwOiBfdG9wLFxuXHQgIHAyOiBfVG9wLFxuXHQgIG9zOiBfYm90dG9tLFxuXHQgIG9zMjogX0JvdHRvbSxcblx0ICBkOiBfaGVpZ2h0LFxuXHQgIGQyOiBfSGVpZ2h0LFxuXHQgIGE6IFwieVwiLFxuXHQgIG9wOiBfaG9yaXpvbnRhbCxcblx0ICBzYzogZnVuY3Rpb24gc2ModmFsdWUpIHtcblx0ICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gX3dpbi5zY3JvbGxUbyhfaG9yaXpvbnRhbC5zYygpLCB2YWx1ZSkgOiBfd2luLnBhZ2VZT2Zmc2V0IHx8IF9kb2NbX3Njcm9sbFRvcF0gfHwgX2RvY0VsW19zY3JvbGxUb3BdIHx8IF9ib2R5W19zY3JvbGxUb3BdIHx8IDA7XG5cdCAgfVxuXHR9LFxuXHQgICAgX2dldENvbXB1dGVkU3R5bGUgPSBmdW5jdGlvbiBfZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSB7XG5cdCAgcmV0dXJuIF93aW4uZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblx0fSxcblx0ICAgIF9tYWtlUG9zaXRpb25hYmxlID0gZnVuY3Rpb24gX21ha2VQb3NpdGlvbmFibGUoZWxlbWVudCkge1xuXHQgIHZhciBwb3NpdGlvbiA9IF9nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLnBvc2l0aW9uO1xuXG5cdCAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IHBvc2l0aW9uID09PSBcImFic29sdXRlXCIgfHwgcG9zaXRpb24gPT09IFwiZml4ZWRcIiA/IHBvc2l0aW9uIDogXCJyZWxhdGl2ZVwiO1xuXHR9LFxuXHQgICAgX3NldERlZmF1bHRzID0gZnVuY3Rpb24gX3NldERlZmF1bHRzKG9iaiwgZGVmYXVsdHMpIHtcblx0ICBmb3IgKHZhciBwIGluIGRlZmF1bHRzKSB7XG5cdCAgICBwIGluIG9iaiB8fCAob2JqW3BdID0gZGVmYXVsdHNbcF0pO1xuXHQgIH1cblxuXHQgIHJldHVybiBvYmo7XG5cdH0sXG5cdCAgICBfZ2V0Qm91bmRzID0gZnVuY3Rpb24gX2dldEJvdW5kcyhlbGVtZW50LCB3aXRob3V0VHJhbnNmb3Jtcykge1xuXHQgIHZhciB0d2VlbiA9IHdpdGhvdXRUcmFuc2Zvcm1zICYmIF9nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpW190cmFuc2Zvcm1Qcm9wXSAhPT0gXCJtYXRyaXgoMSwgMCwgMCwgMSwgMCwgMClcIiAmJiBnc2FwLnRvKGVsZW1lbnQsIHtcblx0ICAgIHg6IDAsXG5cdCAgICB5OiAwLFxuXHQgICAgeFBlcmNlbnQ6IDAsXG5cdCAgICB5UGVyY2VudDogMCxcblx0ICAgIHJvdGF0aW9uOiAwLFxuXHQgICAgcm90YXRpb25YOiAwLFxuXHQgICAgcm90YXRpb25ZOiAwLFxuXHQgICAgc2NhbGU6IDEsXG5cdCAgICBza2V3WDogMCxcblx0ICAgIHNrZXdZOiAwXG5cdCAgfSkucHJvZ3Jlc3MoMSksXG5cdCAgICAgIGJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdCAgdHdlZW4gJiYgdHdlZW4ucHJvZ3Jlc3MoMCkua2lsbCgpO1xuXHQgIHJldHVybiBib3VuZHM7XG5cdH0sXG5cdCAgICBfZ2V0U2l6ZSA9IGZ1bmN0aW9uIF9nZXRTaXplKGVsZW1lbnQsIF9yZWY0KSB7XG5cdCAgdmFyIGQyID0gX3JlZjQuZDI7XG5cdCAgcmV0dXJuIGVsZW1lbnRbXCJvZmZzZXRcIiArIGQyXSB8fCBlbGVtZW50W1wiY2xpZW50XCIgKyBkMl0gfHwgMDtcblx0fSxcblx0ICAgIF9nZXRMYWJlbFJhdGlvQXJyYXkgPSBmdW5jdGlvbiBfZ2V0TGFiZWxSYXRpb0FycmF5KHRpbWVsaW5lKSB7XG5cdCAgdmFyIGEgPSBbXSxcblx0ICAgICAgbGFiZWxzID0gdGltZWxpbmUubGFiZWxzLFxuXHQgICAgICBkdXJhdGlvbiA9IHRpbWVsaW5lLmR1cmF0aW9uKCksXG5cdCAgICAgIHA7XG5cblx0ICBmb3IgKHAgaW4gbGFiZWxzKSB7XG5cdCAgICBhLnB1c2gobGFiZWxzW3BdIC8gZHVyYXRpb24pO1xuXHQgIH1cblxuXHQgIHJldHVybiBhO1xuXHR9LFxuXHQgICAgX2dldENsb3Nlc3RMYWJlbCA9IGZ1bmN0aW9uIF9nZXRDbG9zZXN0TGFiZWwoYW5pbWF0aW9uKSB7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgcmV0dXJuIGdzYXAudXRpbHMuc25hcChfZ2V0TGFiZWxSYXRpb0FycmF5KGFuaW1hdGlvbiksIHZhbHVlKTtcblx0ICB9O1xuXHR9LFxuXHQgICAgX3NuYXBEaXJlY3Rpb25hbCA9IGZ1bmN0aW9uIF9zbmFwRGlyZWN0aW9uYWwoc25hcEluY3JlbWVudE9yQXJyYXkpIHtcblx0ICB2YXIgc25hcCA9IGdzYXAudXRpbHMuc25hcChzbmFwSW5jcmVtZW50T3JBcnJheSksXG5cdCAgICAgIGEgPSBBcnJheS5pc0FycmF5KHNuYXBJbmNyZW1lbnRPckFycmF5KSAmJiBzbmFwSW5jcmVtZW50T3JBcnJheS5zbGljZSgwKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG5cdCAgICByZXR1cm4gYSAtIGI7XG5cdCAgfSk7XG5cdCAgcmV0dXJuIGEgPyBmdW5jdGlvbiAodmFsdWUsIGRpcmVjdGlvbiwgdGhyZXNob2xkKSB7XG5cdCAgICBpZiAodGhyZXNob2xkID09PSB2b2lkIDApIHtcblx0ICAgICAgdGhyZXNob2xkID0gMWUtMztcblx0ICAgIH1cblxuXHQgICAgdmFyIGk7XG5cblx0ICAgIGlmICghZGlyZWN0aW9uKSB7XG5cdCAgICAgIHJldHVybiBzbmFwKHZhbHVlKTtcblx0ICAgIH1cblxuXHQgICAgaWYgKGRpcmVjdGlvbiA+IDApIHtcblx0ICAgICAgdmFsdWUgLT0gdGhyZXNob2xkO1xuXG5cdCAgICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgaWYgKGFbaV0gPj0gdmFsdWUpIHtcblx0ICAgICAgICAgIHJldHVybiBhW2ldO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXG5cdCAgICAgIHJldHVybiBhW2kgLSAxXTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGkgPSBhLmxlbmd0aDtcblx0ICAgICAgdmFsdWUgKz0gdGhyZXNob2xkO1xuXG5cdCAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICBpZiAoYVtpXSA8PSB2YWx1ZSkge1xuXHQgICAgICAgICAgcmV0dXJuIGFbaV07XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBhWzBdO1xuXHQgIH0gOiBmdW5jdGlvbiAodmFsdWUsIGRpcmVjdGlvbiwgdGhyZXNob2xkKSB7XG5cdCAgICBpZiAodGhyZXNob2xkID09PSB2b2lkIDApIHtcblx0ICAgICAgdGhyZXNob2xkID0gMWUtMztcblx0ICAgIH1cblxuXHQgICAgdmFyIHNuYXBwZWQgPSBzbmFwKHZhbHVlKTtcblx0ICAgIHJldHVybiAhZGlyZWN0aW9uIHx8IE1hdGguYWJzKHNuYXBwZWQgLSB2YWx1ZSkgPCB0aHJlc2hvbGQgfHwgc25hcHBlZCAtIHZhbHVlIDwgMCA9PT0gZGlyZWN0aW9uIDwgMCA/IHNuYXBwZWQgOiBzbmFwKGRpcmVjdGlvbiA8IDAgPyB2YWx1ZSAtIHNuYXBJbmNyZW1lbnRPckFycmF5IDogdmFsdWUgKyBzbmFwSW5jcmVtZW50T3JBcnJheSk7XG5cdCAgfTtcblx0fSxcblx0ICAgIF9nZXRMYWJlbEF0RGlyZWN0aW9uID0gZnVuY3Rpb24gX2dldExhYmVsQXREaXJlY3Rpb24odGltZWxpbmUpIHtcblx0ICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCBzdCkge1xuXHQgICAgcmV0dXJuIF9zbmFwRGlyZWN0aW9uYWwoX2dldExhYmVsUmF0aW9BcnJheSh0aW1lbGluZSkpKHZhbHVlLCBzdC5kaXJlY3Rpb24pO1xuXHQgIH07XG5cdH0sXG5cdCAgICBfbXVsdGlMaXN0ZW5lciA9IGZ1bmN0aW9uIF9tdWx0aUxpc3RlbmVyKGZ1bmMsIGVsZW1lbnQsIHR5cGVzLCBjYWxsYmFjaykge1xuXHQgIHJldHVybiB0eXBlcy5zcGxpdChcIixcIikuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuXHQgICAgcmV0dXJuIGZ1bmMoZWxlbWVudCwgdHlwZSwgY2FsbGJhY2spO1xuXHQgIH0pO1xuXHR9LFxuXHQgICAgX2FkZExpc3RlbmVyID0gZnVuY3Rpb24gX2FkZExpc3RlbmVyKGVsZW1lbnQsIHR5cGUsIGZ1bmMpIHtcblx0ICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZ1bmMsIHtcblx0ICAgIHBhc3NpdmU6IHRydWVcblx0ICB9KTtcblx0fSxcblx0ICAgIF9yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIF9yZW1vdmVMaXN0ZW5lcihlbGVtZW50LCB0eXBlLCBmdW5jKSB7XG5cdCAgcmV0dXJuIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW5jKTtcblx0fSxcblx0ICAgIF9tYXJrZXJEZWZhdWx0cyA9IHtcblx0ICBzdGFydENvbG9yOiBcImdyZWVuXCIsXG5cdCAgZW5kQ29sb3I6IFwicmVkXCIsXG5cdCAgaW5kZW50OiAwLFxuXHQgIGZvbnRTaXplOiBcIjE2cHhcIixcblx0ICBmb250V2VpZ2h0OiBcIm5vcm1hbFwiXG5cdH0sXG5cdCAgICBfZGVmYXVsdHMgPSB7XG5cdCAgdG9nZ2xlQWN0aW9uczogXCJwbGF5XCIsXG5cdCAgYW50aWNpcGF0ZVBpbjogMFxuXHR9LFxuXHQgICAgX2tleXdvcmRzID0ge1xuXHQgIHRvcDogMCxcblx0ICBsZWZ0OiAwLFxuXHQgIGNlbnRlcjogMC41LFxuXHQgIGJvdHRvbTogMSxcblx0ICByaWdodDogMVxuXHR9LFxuXHQgICAgX29mZnNldFRvUHggPSBmdW5jdGlvbiBfb2Zmc2V0VG9QeCh2YWx1ZSwgc2l6ZSkge1xuXHQgIGlmIChfaXNTdHJpbmcodmFsdWUpKSB7XG5cdCAgICB2YXIgZXFJbmRleCA9IHZhbHVlLmluZGV4T2YoXCI9XCIpLFxuXHQgICAgICAgIHJlbGF0aXZlID0gfmVxSW5kZXggPyArKHZhbHVlLmNoYXJBdChlcUluZGV4IC0gMSkgKyAxKSAqIHBhcnNlRmxvYXQodmFsdWUuc3Vic3RyKGVxSW5kZXggKyAxKSkgOiAwO1xuXG5cdCAgICBpZiAofmVxSW5kZXgpIHtcblx0ICAgICAgdmFsdWUuaW5kZXhPZihcIiVcIikgPiBlcUluZGV4ICYmIChyZWxhdGl2ZSAqPSBzaXplIC8gMTAwKTtcblx0ICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMCwgZXFJbmRleCAtIDEpO1xuXHQgICAgfVxuXG5cdCAgICB2YWx1ZSA9IHJlbGF0aXZlICsgKHZhbHVlIGluIF9rZXl3b3JkcyA/IF9rZXl3b3Jkc1t2YWx1ZV0gKiBzaXplIDogfnZhbHVlLmluZGV4T2YoXCIlXCIpID8gcGFyc2VGbG9hdCh2YWx1ZSkgKiBzaXplIC8gMTAwIDogcGFyc2VGbG9hdCh2YWx1ZSkgfHwgMCk7XG5cdCAgfVxuXG5cdCAgcmV0dXJuIHZhbHVlO1xuXHR9LFxuXHQgICAgX2NyZWF0ZU1hcmtlciA9IGZ1bmN0aW9uIF9jcmVhdGVNYXJrZXIodHlwZSwgbmFtZSwgY29udGFpbmVyLCBkaXJlY3Rpb24sIF9yZWY1LCBvZmZzZXQsIG1hdGNoV2lkdGhFbCwgY29udGFpbmVyQW5pbWF0aW9uKSB7XG5cdCAgdmFyIHN0YXJ0Q29sb3IgPSBfcmVmNS5zdGFydENvbG9yLFxuXHQgICAgICBlbmRDb2xvciA9IF9yZWY1LmVuZENvbG9yLFxuXHQgICAgICBmb250U2l6ZSA9IF9yZWY1LmZvbnRTaXplLFxuXHQgICAgICBpbmRlbnQgPSBfcmVmNS5pbmRlbnQsXG5cdCAgICAgIGZvbnRXZWlnaHQgPSBfcmVmNS5mb250V2VpZ2h0O1xuXG5cdCAgdmFyIGUgPSBfZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG5cdCAgICAgIHVzZUZpeGVkUG9zaXRpb24gPSBfaXNWaWV3cG9ydChjb250YWluZXIpIHx8IF9nZXRQcm94eVByb3AoY29udGFpbmVyLCBcInBpblR5cGVcIikgPT09IFwiZml4ZWRcIixcblx0ICAgICAgaXNTY3JvbGxlciA9IHR5cGUuaW5kZXhPZihcInNjcm9sbGVyXCIpICE9PSAtMSxcblx0ICAgICAgcGFyZW50ID0gdXNlRml4ZWRQb3NpdGlvbiA/IF9ib2R5IDogY29udGFpbmVyLFxuXHQgICAgICBpc1N0YXJ0ID0gdHlwZS5pbmRleE9mKFwic3RhcnRcIikgIT09IC0xLFxuXHQgICAgICBjb2xvciA9IGlzU3RhcnQgPyBzdGFydENvbG9yIDogZW5kQ29sb3IsXG5cdCAgICAgIGNzcyA9IFwiYm9yZGVyLWNvbG9yOlwiICsgY29sb3IgKyBcIjtmb250LXNpemU6XCIgKyBmb250U2l6ZSArIFwiO2NvbG9yOlwiICsgY29sb3IgKyBcIjtmb250LXdlaWdodDpcIiArIGZvbnRXZWlnaHQgKyBcIjtwb2ludGVyLWV2ZW50czpub25lO3doaXRlLXNwYWNlOm5vd3JhcDtmb250LWZhbWlseTpzYW5zLXNlcmlmLEFyaWFsO3otaW5kZXg6MTAwMDtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXdpZHRoOjA7Ym9yZGVyLXN0eWxlOnNvbGlkO1wiO1xuXG5cdCAgY3NzICs9IFwicG9zaXRpb246XCIgKyAoKGlzU2Nyb2xsZXIgfHwgY29udGFpbmVyQW5pbWF0aW9uKSAmJiB1c2VGaXhlZFBvc2l0aW9uID8gXCJmaXhlZDtcIiA6IFwiYWJzb2x1dGU7XCIpO1xuXHQgIChpc1Njcm9sbGVyIHx8IGNvbnRhaW5lckFuaW1hdGlvbiB8fCAhdXNlRml4ZWRQb3NpdGlvbikgJiYgKGNzcyArPSAoZGlyZWN0aW9uID09PSBfdmVydGljYWwgPyBfcmlnaHQgOiBfYm90dG9tKSArIFwiOlwiICsgKG9mZnNldCArIHBhcnNlRmxvYXQoaW5kZW50KSkgKyBcInB4O1wiKTtcblx0ICBtYXRjaFdpZHRoRWwgJiYgKGNzcyArPSBcImJveC1zaXppbmc6Ym9yZGVyLWJveDt0ZXh0LWFsaWduOmxlZnQ7d2lkdGg6XCIgKyBtYXRjaFdpZHRoRWwub2Zmc2V0V2lkdGggKyBcInB4O1wiKTtcblx0ICBlLl9pc1N0YXJ0ID0gaXNTdGFydDtcblx0ICBlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiZ3NhcC1tYXJrZXItXCIgKyB0eXBlICsgKG5hbWUgPyBcIiBtYXJrZXItXCIgKyBuYW1lIDogXCJcIikpO1xuXHQgIGUuc3R5bGUuY3NzVGV4dCA9IGNzcztcblx0ICBlLmlubmVyVGV4dCA9IG5hbWUgfHwgbmFtZSA9PT0gMCA/IHR5cGUgKyBcIi1cIiArIG5hbWUgOiB0eXBlO1xuXHQgIHBhcmVudC5jaGlsZHJlblswXSA/IHBhcmVudC5pbnNlcnRCZWZvcmUoZSwgcGFyZW50LmNoaWxkcmVuWzBdKSA6IHBhcmVudC5hcHBlbmRDaGlsZChlKTtcblx0ICBlLl9vZmZzZXQgPSBlW1wib2Zmc2V0XCIgKyBkaXJlY3Rpb24ub3AuZDJdO1xuXG5cdCAgX3Bvc2l0aW9uTWFya2VyKGUsIDAsIGRpcmVjdGlvbiwgaXNTdGFydCk7XG5cblx0ICByZXR1cm4gZTtcblx0fSxcblx0ICAgIF9wb3NpdGlvbk1hcmtlciA9IGZ1bmN0aW9uIF9wb3NpdGlvbk1hcmtlcihtYXJrZXIsIHN0YXJ0LCBkaXJlY3Rpb24sIGZsaXBwZWQpIHtcblx0ICB2YXIgdmFycyA9IHtcblx0ICAgIGRpc3BsYXk6IFwiYmxvY2tcIlxuXHQgIH0sXG5cdCAgICAgIHNpZGUgPSBkaXJlY3Rpb25bZmxpcHBlZCA/IFwib3MyXCIgOiBcInAyXCJdLFxuXHQgICAgICBvcHBvc2l0ZVNpZGUgPSBkaXJlY3Rpb25bZmxpcHBlZCA/IFwicDJcIiA6IFwib3MyXCJdO1xuXHQgIG1hcmtlci5faXNGbGlwcGVkID0gZmxpcHBlZDtcblx0ICB2YXJzW2RpcmVjdGlvbi5hICsgXCJQZXJjZW50XCJdID0gZmxpcHBlZCA/IC0xMDAgOiAwO1xuXHQgIHZhcnNbZGlyZWN0aW9uLmFdID0gZmxpcHBlZCA/IFwiMXB4XCIgOiAwO1xuXHQgIHZhcnNbXCJib3JkZXJcIiArIHNpZGUgKyBfV2lkdGhdID0gMTtcblx0ICB2YXJzW1wiYm9yZGVyXCIgKyBvcHBvc2l0ZVNpZGUgKyBfV2lkdGhdID0gMDtcblx0ICB2YXJzW2RpcmVjdGlvbi5wXSA9IHN0YXJ0ICsgXCJweFwiO1xuXHQgIGdzYXAuc2V0KG1hcmtlciwgdmFycyk7XG5cdH0sXG5cdCAgICBfdHJpZ2dlcnMgPSBbXSxcblx0ICAgIF9pZHMgPSB7fSxcblx0ICAgIF9zeW5jID0gZnVuY3Rpb24gX3N5bmMoKSB7XG5cdCAgcmV0dXJuIF9nZXRUaW1lKCkgLSBfbGFzdFNjcm9sbFRpbWUgPiAzNCAmJiBfdXBkYXRlQWxsKCk7XG5cdH0sXG5cdCAgICBfb25TY3JvbGwgPSBmdW5jdGlvbiBfb25TY3JvbGwoKSB7XG5cdCAgX3VwZGF0ZUFsbCgpO1xuXG5cdCAgX2xhc3RTY3JvbGxUaW1lIHx8IF9kaXNwYXRjaChcInNjcm9sbFN0YXJ0XCIpO1xuXHQgIF9sYXN0U2Nyb2xsVGltZSA9IF9nZXRUaW1lKCk7XG5cdH0sXG5cdCAgICBfb25SZXNpemUgPSBmdW5jdGlvbiBfb25SZXNpemUoKSB7XG5cdCAgcmV0dXJuICFfcmVmcmVzaGluZyAmJiAhX2lnbm9yZVJlc2l6ZSAmJiAhX2RvYy5mdWxsc2NyZWVuRWxlbWVudCAmJiBfcmVzaXplRGVsYXkucmVzdGFydCh0cnVlKTtcblx0fSxcblx0ICAgIF9saXN0ZW5lcnMgPSB7fSxcblx0ICAgIF9lbXB0eUFycmF5ID0gW10sXG5cdCAgICBfbWVkaWEgPSBbXSxcblx0ICAgIF9jcmVhdGluZ01lZGlhLFxuXHQgICAgX2xhc3RNZWRpYVRpY2ssXG5cdCAgICBfb25NZWRpYUNoYW5nZSA9IGZ1bmN0aW9uIF9vbk1lZGlhQ2hhbmdlKGUpIHtcblx0ICB2YXIgdGljayA9IGdzYXAudGlja2VyLmZyYW1lLFxuXHQgICAgICBtYXRjaGVzID0gW10sXG5cdCAgICAgIGkgPSAwLFxuXHQgICAgICBpbmRleDtcblxuXHQgIGlmIChfbGFzdE1lZGlhVGljayAhPT0gdGljayB8fCBfc3RhcnR1cCkge1xuXHQgICAgX3JldmVydEFsbCgpO1xuXG5cdCAgICBmb3IgKDsgaSA8IF9tZWRpYS5sZW5ndGg7IGkgKz0gNCkge1xuXHQgICAgICBpbmRleCA9IF93aW4ubWF0Y2hNZWRpYShfbWVkaWFbaV0pLm1hdGNoZXM7XG5cblx0ICAgICAgaWYgKGluZGV4ICE9PSBfbWVkaWFbaSArIDNdKSB7XG5cdCAgICAgICAgX21lZGlhW2kgKyAzXSA9IGluZGV4O1xuXHQgICAgICAgIGluZGV4ID8gbWF0Y2hlcy5wdXNoKGkpIDogX3JldmVydEFsbCgxLCBfbWVkaWFbaV0pIHx8IF9pc0Z1bmN0aW9uKF9tZWRpYVtpICsgMl0pICYmIF9tZWRpYVtpICsgMl0oKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICBfcmV2ZXJ0UmVjb3JkZWQoKTtcblxuXHQgICAgZm9yIChpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIHtcblx0ICAgICAgaW5kZXggPSBtYXRjaGVzW2ldO1xuXHQgICAgICBfY3JlYXRpbmdNZWRpYSA9IF9tZWRpYVtpbmRleF07XG5cdCAgICAgIF9tZWRpYVtpbmRleCArIDJdID0gX21lZGlhW2luZGV4ICsgMV0oZSk7XG5cdCAgICB9XG5cblx0ICAgIF9jcmVhdGluZ01lZGlhID0gMDtcblx0ICAgIF9jb3JlSW5pdHRlZCAmJiBfcmVmcmVzaEFsbCgwLCAxKTtcblx0ICAgIF9sYXN0TWVkaWFUaWNrID0gdGljaztcblxuXHQgICAgX2Rpc3BhdGNoKFwibWF0Y2hNZWRpYVwiKTtcblx0ICB9XG5cdH0sXG5cdCAgICBfc29mdFJlZnJlc2ggPSBmdW5jdGlvbiBfc29mdFJlZnJlc2goKSB7XG5cdCAgcmV0dXJuIF9yZW1vdmVMaXN0ZW5lcihTY3JvbGxUcmlnZ2VyLCBcInNjcm9sbEVuZFwiLCBfc29mdFJlZnJlc2gpIHx8IF9yZWZyZXNoQWxsKHRydWUpO1xuXHR9LFxuXHQgICAgX2Rpc3BhdGNoID0gZnVuY3Rpb24gX2Rpc3BhdGNoKHR5cGUpIHtcblx0ICByZXR1cm4gX2xpc3RlbmVyc1t0eXBlXSAmJiBfbGlzdGVuZXJzW3R5cGVdLm1hcChmdW5jdGlvbiAoZikge1xuXHQgICAgcmV0dXJuIGYoKTtcblx0ICB9KSB8fCBfZW1wdHlBcnJheTtcblx0fSxcblx0ICAgIF9zYXZlZFN0eWxlcyA9IFtdLFxuXHQgICAgX3JldmVydFJlY29yZGVkID0gZnVuY3Rpb24gX3JldmVydFJlY29yZGVkKG1lZGlhKSB7XG5cdCAgZm9yICh2YXIgaSA9IDA7IGkgPCBfc2F2ZWRTdHlsZXMubGVuZ3RoOyBpICs9IDUpIHtcblx0ICAgIGlmICghbWVkaWEgfHwgX3NhdmVkU3R5bGVzW2kgKyA0XSA9PT0gbWVkaWEpIHtcblx0ICAgICAgX3NhdmVkU3R5bGVzW2ldLnN0eWxlLmNzc1RleHQgPSBfc2F2ZWRTdHlsZXNbaSArIDFdO1xuXHQgICAgICBfc2F2ZWRTdHlsZXNbaV0uZ2V0QkJveCAmJiBfc2F2ZWRTdHlsZXNbaV0uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIF9zYXZlZFN0eWxlc1tpICsgMl0gfHwgXCJcIik7XG5cdCAgICAgIF9zYXZlZFN0eWxlc1tpICsgM10udW5jYWNoZSA9IDE7XG5cdCAgICB9XG5cdCAgfVxuXHR9LFxuXHQgICAgX3JldmVydEFsbCA9IGZ1bmN0aW9uIF9yZXZlcnRBbGwoa2lsbCwgbWVkaWEpIHtcblx0ICB2YXIgdHJpZ2dlcjtcblxuXHQgIGZvciAoX2kgPSAwOyBfaSA8IF90cmlnZ2Vycy5sZW5ndGg7IF9pKyspIHtcblx0ICAgIHRyaWdnZXIgPSBfdHJpZ2dlcnNbX2ldO1xuXG5cdCAgICBpZiAoIW1lZGlhIHx8IHRyaWdnZXIubWVkaWEgPT09IG1lZGlhKSB7XG5cdCAgICAgIGlmIChraWxsKSB7XG5cdCAgICAgICAgdHJpZ2dlci5raWxsKDEpO1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIHRyaWdnZXIucmV2ZXJ0KCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cblx0ICBtZWRpYSAmJiBfcmV2ZXJ0UmVjb3JkZWQobWVkaWEpO1xuXHQgIG1lZGlhIHx8IF9kaXNwYXRjaChcInJldmVydFwiKTtcblx0fSxcblx0ICAgIF9jbGVhclNjcm9sbE1lbW9yeSA9IGZ1bmN0aW9uIF9jbGVhclNjcm9sbE1lbW9yeSgpIHtcblx0ICByZXR1cm4gX3Njcm9sbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYmopIHtcblx0ICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgJiYgKG9iai5yZWMgPSAwKTtcblx0ICB9KTtcblx0fSxcblx0ICAgIF9yZWZyZXNoaW5nQWxsLFxuXHQgICAgX3JlZnJlc2hBbGwgPSBmdW5jdGlvbiBfcmVmcmVzaEFsbChmb3JjZSwgc2tpcFJldmVydCkge1xuXHQgIGlmIChfbGFzdFNjcm9sbFRpbWUgJiYgIWZvcmNlKSB7XG5cdCAgICBfYWRkTGlzdGVuZXIoU2Nyb2xsVHJpZ2dlciwgXCJzY3JvbGxFbmRcIiwgX3NvZnRSZWZyZXNoKTtcblxuXHQgICAgcmV0dXJuO1xuXHQgIH1cblxuXHQgIF9yZWZyZXNoaW5nQWxsID0gdHJ1ZTtcblxuXHQgIHZhciByZWZyZXNoSW5pdHMgPSBfZGlzcGF0Y2goXCJyZWZyZXNoSW5pdFwiKTtcblxuXHQgIF9zb3J0ICYmIFNjcm9sbFRyaWdnZXIuc29ydCgpO1xuXHQgIHNraXBSZXZlcnQgfHwgX3JldmVydEFsbCgpO1xuXG5cdCAgX3RyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcblx0ICAgIHJldHVybiB0LnJlZnJlc2goKTtcblx0ICB9KTtcblxuXHQgIF90cmlnZ2Vycy5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XG5cdCAgICByZXR1cm4gdC52YXJzLmVuZCA9PT0gXCJtYXhcIiAmJiB0LnNldFBvc2l0aW9ucyh0LnN0YXJ0LCBfbWF4U2Nyb2xsKHQuc2Nyb2xsZXIsIHQuX2RpcikpO1xuXHQgIH0pO1xuXG5cdCAgcmVmcmVzaEluaXRzLmZvckVhY2goZnVuY3Rpb24gKHJlc3VsdCkge1xuXHQgICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHQucmVuZGVyICYmIHJlc3VsdC5yZW5kZXIoLTEpO1xuXHQgIH0pO1xuXG5cdCAgX2NsZWFyU2Nyb2xsTWVtb3J5KCk7XG5cblx0ICBfcmVzaXplRGVsYXkucGF1c2UoKTtcblxuXHQgIF9yZWZyZXNoaW5nQWxsID0gZmFsc2U7XG5cblx0ICBfZGlzcGF0Y2goXCJyZWZyZXNoXCIpO1xuXHR9LFxuXHQgICAgX2xhc3RTY3JvbGwgPSAwLFxuXHQgICAgX2RpcmVjdGlvbiA9IDEsXG5cdCAgICBfdXBkYXRlQWxsID0gZnVuY3Rpb24gX3VwZGF0ZUFsbCgpIHtcblx0ICBpZiAoIV9yZWZyZXNoaW5nQWxsKSB7XG5cdCAgICB2YXIgbCA9IF90cmlnZ2Vycy5sZW5ndGgsXG5cdCAgICAgICAgdGltZSA9IF9nZXRUaW1lKCksXG5cdCAgICAgICAgcmVjb3JkVmVsb2NpdHkgPSB0aW1lIC0gX3RpbWUxID49IDUwLFxuXHQgICAgICAgIHNjcm9sbCA9IGwgJiYgX3RyaWdnZXJzWzBdLnNjcm9sbCgpO1xuXG5cdCAgICBfZGlyZWN0aW9uID0gX2xhc3RTY3JvbGwgPiBzY3JvbGwgPyAtMSA6IDE7XG5cdCAgICBfbGFzdFNjcm9sbCA9IHNjcm9sbDtcblxuXHQgICAgaWYgKHJlY29yZFZlbG9jaXR5KSB7XG5cdCAgICAgIGlmIChfbGFzdFNjcm9sbFRpbWUgJiYgIV9wb2ludGVySXNEb3duICYmIHRpbWUgLSBfbGFzdFNjcm9sbFRpbWUgPiAyMDApIHtcblx0ICAgICAgICBfbGFzdFNjcm9sbFRpbWUgPSAwO1xuXG5cdCAgICAgICAgX2Rpc3BhdGNoKFwic2Nyb2xsRW5kXCIpO1xuXHQgICAgICB9XG5cblx0ICAgICAgX3RpbWUyID0gX3RpbWUxO1xuXHQgICAgICBfdGltZTEgPSB0aW1lO1xuXHQgICAgfVxuXG5cdCAgICBpZiAoX2RpcmVjdGlvbiA8IDApIHtcblx0ICAgICAgX2kgPSBsO1xuXG5cdCAgICAgIHdoaWxlIChfaS0tID4gMCkge1xuXHQgICAgICAgIF90cmlnZ2Vyc1tfaV0gJiYgX3RyaWdnZXJzW19pXS51cGRhdGUoMCwgcmVjb3JkVmVsb2NpdHkpO1xuXHQgICAgICB9XG5cblx0ICAgICAgX2RpcmVjdGlvbiA9IDE7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBmb3IgKF9pID0gMDsgX2kgPCBsOyBfaSsrKSB7XG5cdCAgICAgICAgX3RyaWdnZXJzW19pXSAmJiBfdHJpZ2dlcnNbX2ldLnVwZGF0ZSgwLCByZWNvcmRWZWxvY2l0eSk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH0sXG5cdCAgICBfcHJvcE5hbWVzVG9Db3B5ID0gW19sZWZ0LCBfdG9wLCBfYm90dG9tLCBfcmlnaHQsIF9tYXJnaW4gKyBfQm90dG9tLCBfbWFyZ2luICsgX1JpZ2h0LCBfbWFyZ2luICsgX1RvcCwgX21hcmdpbiArIF9MZWZ0LCBcImRpc3BsYXlcIiwgXCJmbGV4U2hyaW5rXCIsIFwiZmxvYXRcIiwgXCJ6SW5kZXhcIiwgXCJncmlkQ29sdW1uU3RhcnRcIiwgXCJncmlkQ29sdW1uRW5kXCIsIFwiZ3JpZFJvd1N0YXJ0XCIsIFwiZ3JpZFJvd0VuZFwiLCBcImdyaWRBcmVhXCIsIFwianVzdGlmeVNlbGZcIiwgXCJhbGlnblNlbGZcIiwgXCJwbGFjZVNlbGZcIiwgXCJvcmRlclwiXSxcblx0ICAgIF9zdGF0ZVByb3BzID0gX3Byb3BOYW1lc1RvQ29weS5jb25jYXQoW193aWR0aCwgX2hlaWdodCwgXCJib3hTaXppbmdcIiwgXCJtYXhcIiArIF9XaWR0aCwgXCJtYXhcIiArIF9IZWlnaHQsIFwicG9zaXRpb25cIiwgX21hcmdpbiwgX3BhZGRpbmcsIF9wYWRkaW5nICsgX1RvcCwgX3BhZGRpbmcgKyBfUmlnaHQsIF9wYWRkaW5nICsgX0JvdHRvbSwgX3BhZGRpbmcgKyBfTGVmdF0pLFxuXHQgICAgX3N3YXBQaW5PdXQgPSBmdW5jdGlvbiBfc3dhcFBpbk91dChwaW4sIHNwYWNlciwgc3RhdGUpIHtcblx0ICBfc2V0U3RhdGUoc3RhdGUpO1xuXG5cdCAgdmFyIGNhY2hlID0gcGluLl9nc2FwO1xuXG5cdCAgaWYgKGNhY2hlLnNwYWNlcklzTmF0aXZlKSB7XG5cdCAgICBfc2V0U3RhdGUoY2FjaGUuc3BhY2VyU3RhdGUpO1xuXHQgIH0gZWxzZSBpZiAocGluLnBhcmVudE5vZGUgPT09IHNwYWNlcikge1xuXHQgICAgdmFyIHBhcmVudCA9IHNwYWNlci5wYXJlbnROb2RlO1xuXG5cdCAgICBpZiAocGFyZW50KSB7XG5cdCAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUocGluLCBzcGFjZXIpO1xuXHQgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoc3BhY2VyKTtcblx0ICAgIH1cblx0ICB9XG5cdH0sXG5cdCAgICBfc3dhcFBpbkluID0gZnVuY3Rpb24gX3N3YXBQaW5JbihwaW4sIHNwYWNlciwgY3MsIHNwYWNlclN0YXRlKSB7XG5cdCAgaWYgKHBpbi5wYXJlbnROb2RlICE9PSBzcGFjZXIpIHtcblx0ICAgIHZhciBpID0gX3Byb3BOYW1lc1RvQ29weS5sZW5ndGgsXG5cdCAgICAgICAgc3BhY2VyU3R5bGUgPSBzcGFjZXIuc3R5bGUsXG5cdCAgICAgICAgcGluU3R5bGUgPSBwaW4uc3R5bGUsXG5cdCAgICAgICAgcDtcblxuXHQgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICBwID0gX3Byb3BOYW1lc1RvQ29weVtpXTtcblx0ICAgICAgc3BhY2VyU3R5bGVbcF0gPSBjc1twXTtcblx0ICAgIH1cblxuXHQgICAgc3BhY2VyU3R5bGUucG9zaXRpb24gPSBjcy5wb3NpdGlvbiA9PT0gXCJhYnNvbHV0ZVwiID8gXCJhYnNvbHV0ZVwiIDogXCJyZWxhdGl2ZVwiO1xuXHQgICAgY3MuZGlzcGxheSA9PT0gXCJpbmxpbmVcIiAmJiAoc3BhY2VyU3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCIpO1xuXHQgICAgcGluU3R5bGVbX2JvdHRvbV0gPSBwaW5TdHlsZVtfcmlnaHRdID0gc3BhY2VyU3R5bGUuZmxleEJhc2lzID0gXCJhdXRvXCI7XG5cdCAgICBzcGFjZXJTdHlsZS5vdmVyZmxvdyA9IFwidmlzaWJsZVwiO1xuXHQgICAgc3BhY2VyU3R5bGUuYm94U2l6aW5nID0gXCJib3JkZXItYm94XCI7XG5cdCAgICBzcGFjZXJTdHlsZVtfd2lkdGhdID0gX2dldFNpemUocGluLCBfaG9yaXpvbnRhbCkgKyBfcHg7XG5cdCAgICBzcGFjZXJTdHlsZVtfaGVpZ2h0XSA9IF9nZXRTaXplKHBpbiwgX3ZlcnRpY2FsKSArIF9weDtcblx0ICAgIHNwYWNlclN0eWxlW19wYWRkaW5nXSA9IHBpblN0eWxlW19tYXJnaW5dID0gcGluU3R5bGVbX3RvcF0gPSBwaW5TdHlsZVtfbGVmdF0gPSBcIjBcIjtcblxuXHQgICAgX3NldFN0YXRlKHNwYWNlclN0YXRlKTtcblxuXHQgICAgcGluU3R5bGVbX3dpZHRoXSA9IHBpblN0eWxlW1wibWF4XCIgKyBfV2lkdGhdID0gY3NbX3dpZHRoXTtcblx0ICAgIHBpblN0eWxlW19oZWlnaHRdID0gcGluU3R5bGVbXCJtYXhcIiArIF9IZWlnaHRdID0gY3NbX2hlaWdodF07XG5cdCAgICBwaW5TdHlsZVtfcGFkZGluZ10gPSBjc1tfcGFkZGluZ107XG5cdCAgICBwaW4ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3BhY2VyLCBwaW4pO1xuXHQgICAgc3BhY2VyLmFwcGVuZENoaWxkKHBpbik7XG5cdCAgfVxuXHR9LFxuXHQgICAgX2NhcHNFeHAgPSAvKFtBLVpdKS9nLFxuXHQgICAgX3NldFN0YXRlID0gZnVuY3Rpb24gX3NldFN0YXRlKHN0YXRlKSB7XG5cdCAgaWYgKHN0YXRlKSB7XG5cdCAgICB2YXIgc3R5bGUgPSBzdGF0ZS50LnN0eWxlLFxuXHQgICAgICAgIGwgPSBzdGF0ZS5sZW5ndGgsXG5cdCAgICAgICAgaSA9IDAsXG5cdCAgICAgICAgcCxcblx0ICAgICAgICB2YWx1ZTtcblx0ICAgIChzdGF0ZS50Ll9nc2FwIHx8IGdzYXAuY29yZS5nZXRDYWNoZShzdGF0ZS50KSkudW5jYWNoZSA9IDE7XG5cblx0ICAgIGZvciAoOyBpIDwgbDsgaSArPSAyKSB7XG5cdCAgICAgIHZhbHVlID0gc3RhdGVbaSArIDFdO1xuXHQgICAgICBwID0gc3RhdGVbaV07XG5cblx0ICAgICAgaWYgKHZhbHVlKSB7XG5cdCAgICAgICAgc3R5bGVbcF0gPSB2YWx1ZTtcblx0ICAgICAgfSBlbHNlIGlmIChzdHlsZVtwXSkge1xuXHQgICAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KHAucmVwbGFjZShfY2Fwc0V4cCwgXCItJDFcIikudG9Mb3dlckNhc2UoKSk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH0sXG5cdCAgICBfZ2V0U3RhdGUgPSBmdW5jdGlvbiBfZ2V0U3RhdGUoZWxlbWVudCkge1xuXHQgIHZhciBsID0gX3N0YXRlUHJvcHMubGVuZ3RoLFxuXHQgICAgICBzdHlsZSA9IGVsZW1lbnQuc3R5bGUsXG5cdCAgICAgIHN0YXRlID0gW10sXG5cdCAgICAgIGkgPSAwO1xuXG5cdCAgZm9yICg7IGkgPCBsOyBpKyspIHtcblx0ICAgIHN0YXRlLnB1c2goX3N0YXRlUHJvcHNbaV0sIHN0eWxlW19zdGF0ZVByb3BzW2ldXSk7XG5cdCAgfVxuXG5cdCAgc3RhdGUudCA9IGVsZW1lbnQ7XG5cdCAgcmV0dXJuIHN0YXRlO1xuXHR9LFxuXHQgICAgX2NvcHlTdGF0ZSA9IGZ1bmN0aW9uIF9jb3B5U3RhdGUoc3RhdGUsIG92ZXJyaWRlLCBvbWl0T2Zmc2V0cykge1xuXHQgIHZhciByZXN1bHQgPSBbXSxcblx0ICAgICAgbCA9IHN0YXRlLmxlbmd0aCxcblx0ICAgICAgaSA9IG9taXRPZmZzZXRzID8gOCA6IDAsXG5cdCAgICAgIHA7XG5cblx0ICBmb3IgKDsgaSA8IGw7IGkgKz0gMikge1xuXHQgICAgcCA9IHN0YXRlW2ldO1xuXHQgICAgcmVzdWx0LnB1c2gocCwgcCBpbiBvdmVycmlkZSA/IG92ZXJyaWRlW3BdIDogc3RhdGVbaSArIDFdKTtcblx0ICB9XG5cblx0ICByZXN1bHQudCA9IHN0YXRlLnQ7XG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fSxcblx0ICAgIF93aW5PZmZzZXRzID0ge1xuXHQgIGxlZnQ6IDAsXG5cdCAgdG9wOiAwXG5cdH0sXG5cdCAgICBfcGFyc2VQb3NpdGlvbiA9IGZ1bmN0aW9uIF9wYXJzZVBvc2l0aW9uKHZhbHVlLCB0cmlnZ2VyLCBzY3JvbGxlclNpemUsIGRpcmVjdGlvbiwgc2Nyb2xsLCBtYXJrZXIsIG1hcmtlclNjcm9sbGVyLCBzZWxmLCBzY3JvbGxlckJvdW5kcywgYm9yZGVyV2lkdGgsIHVzZUZpeGVkUG9zaXRpb24sIHNjcm9sbGVyTWF4LCBjb250YWluZXJBbmltYXRpb24pIHtcblx0ICBfaXNGdW5jdGlvbih2YWx1ZSkgJiYgKHZhbHVlID0gdmFsdWUoc2VsZikpO1xuXG5cdCAgaWYgKF9pc1N0cmluZyh2YWx1ZSkgJiYgdmFsdWUuc3Vic3RyKDAsIDMpID09PSBcIm1heFwiKSB7XG5cdCAgICB2YWx1ZSA9IHNjcm9sbGVyTWF4ICsgKHZhbHVlLmNoYXJBdCg0KSA9PT0gXCI9XCIgPyBfb2Zmc2V0VG9QeChcIjBcIiArIHZhbHVlLnN1YnN0cigzKSwgc2Nyb2xsZXJTaXplKSA6IDApO1xuXHQgIH1cblxuXHQgIHZhciB0aW1lID0gY29udGFpbmVyQW5pbWF0aW9uID8gY29udGFpbmVyQW5pbWF0aW9uLnRpbWUoKSA6IDAsXG5cdCAgICAgIHAxLFxuXHQgICAgICBwMixcblx0ICAgICAgZWxlbWVudDtcblx0ICBjb250YWluZXJBbmltYXRpb24gJiYgY29udGFpbmVyQW5pbWF0aW9uLnNlZWsoMCk7XG5cblx0ICBpZiAoIV9pc051bWJlcih2YWx1ZSkpIHtcblx0ICAgIF9pc0Z1bmN0aW9uKHRyaWdnZXIpICYmICh0cmlnZ2VyID0gdHJpZ2dlcihzZWxmKSk7XG5cdCAgICB2YXIgb2Zmc2V0cyA9IHZhbHVlLnNwbGl0KFwiIFwiKSxcblx0ICAgICAgICBib3VuZHMsXG5cdCAgICAgICAgbG9jYWxPZmZzZXQsXG5cdCAgICAgICAgZ2xvYmFsT2Zmc2V0LFxuXHQgICAgICAgIGRpc3BsYXk7XG5cdCAgICBlbGVtZW50ID0gX2dldFRhcmdldCh0cmlnZ2VyKSB8fCBfYm9keTtcblx0ICAgIGJvdW5kcyA9IF9nZXRCb3VuZHMoZWxlbWVudCkgfHwge307XG5cblx0ICAgIGlmICgoIWJvdW5kcyB8fCAhYm91bmRzLmxlZnQgJiYgIWJvdW5kcy50b3ApICYmIF9nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmRpc3BsYXkgPT09IFwibm9uZVwiKSB7XG5cdCAgICAgIGRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXk7XG5cdCAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0ICAgICAgYm91bmRzID0gX2dldEJvdW5kcyhlbGVtZW50KTtcblx0ICAgICAgZGlzcGxheSA/IGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXkgOiBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZGlzcGxheVwiKTtcblx0ICAgIH1cblxuXHQgICAgbG9jYWxPZmZzZXQgPSBfb2Zmc2V0VG9QeChvZmZzZXRzWzBdLCBib3VuZHNbZGlyZWN0aW9uLmRdKTtcblx0ICAgIGdsb2JhbE9mZnNldCA9IF9vZmZzZXRUb1B4KG9mZnNldHNbMV0gfHwgXCIwXCIsIHNjcm9sbGVyU2l6ZSk7XG5cdCAgICB2YWx1ZSA9IGJvdW5kc1tkaXJlY3Rpb24ucF0gLSBzY3JvbGxlckJvdW5kc1tkaXJlY3Rpb24ucF0gLSBib3JkZXJXaWR0aCArIGxvY2FsT2Zmc2V0ICsgc2Nyb2xsIC0gZ2xvYmFsT2Zmc2V0O1xuXHQgICAgbWFya2VyU2Nyb2xsZXIgJiYgX3Bvc2l0aW9uTWFya2VyKG1hcmtlclNjcm9sbGVyLCBnbG9iYWxPZmZzZXQsIGRpcmVjdGlvbiwgc2Nyb2xsZXJTaXplIC0gZ2xvYmFsT2Zmc2V0IDwgMjAgfHwgbWFya2VyU2Nyb2xsZXIuX2lzU3RhcnQgJiYgZ2xvYmFsT2Zmc2V0ID4gMjApO1xuXHQgICAgc2Nyb2xsZXJTaXplIC09IHNjcm9sbGVyU2l6ZSAtIGdsb2JhbE9mZnNldDtcblx0ICB9IGVsc2UgaWYgKG1hcmtlclNjcm9sbGVyKSB7XG5cdCAgICBfcG9zaXRpb25NYXJrZXIobWFya2VyU2Nyb2xsZXIsIHNjcm9sbGVyU2l6ZSwgZGlyZWN0aW9uLCB0cnVlKTtcblx0ICB9XG5cblx0ICBpZiAobWFya2VyKSB7XG5cdCAgICB2YXIgcG9zaXRpb24gPSB2YWx1ZSArIHNjcm9sbGVyU2l6ZSxcblx0ICAgICAgICBpc1N0YXJ0ID0gbWFya2VyLl9pc1N0YXJ0O1xuXHQgICAgcDEgPSBcInNjcm9sbFwiICsgZGlyZWN0aW9uLmQyO1xuXG5cdCAgICBfcG9zaXRpb25NYXJrZXIobWFya2VyLCBwb3NpdGlvbiwgZGlyZWN0aW9uLCBpc1N0YXJ0ICYmIHBvc2l0aW9uID4gMjAgfHwgIWlzU3RhcnQgJiYgKHVzZUZpeGVkUG9zaXRpb24gPyBNYXRoLm1heChfYm9keVtwMV0sIF9kb2NFbFtwMV0pIDogbWFya2VyLnBhcmVudE5vZGVbcDFdKSA8PSBwb3NpdGlvbiArIDEpO1xuXG5cdCAgICBpZiAodXNlRml4ZWRQb3NpdGlvbikge1xuXHQgICAgICBzY3JvbGxlckJvdW5kcyA9IF9nZXRCb3VuZHMobWFya2VyU2Nyb2xsZXIpO1xuXHQgICAgICB1c2VGaXhlZFBvc2l0aW9uICYmIChtYXJrZXIuc3R5bGVbZGlyZWN0aW9uLm9wLnBdID0gc2Nyb2xsZXJCb3VuZHNbZGlyZWN0aW9uLm9wLnBdIC0gZGlyZWN0aW9uLm9wLm0gLSBtYXJrZXIuX29mZnNldCArIF9weCk7XG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgaWYgKGNvbnRhaW5lckFuaW1hdGlvbiAmJiBlbGVtZW50KSB7XG5cdCAgICBwMSA9IF9nZXRCb3VuZHMoZWxlbWVudCk7XG5cdCAgICBjb250YWluZXJBbmltYXRpb24uc2VlayhzY3JvbGxlck1heCk7XG5cdCAgICBwMiA9IF9nZXRCb3VuZHMoZWxlbWVudCk7XG5cdCAgICBjb250YWluZXJBbmltYXRpb24uX2NhU2Nyb2xsRGlzdCA9IHAxW2RpcmVjdGlvbi5wXSAtIHAyW2RpcmVjdGlvbi5wXTtcblx0ICAgIHZhbHVlID0gdmFsdWUgLyBjb250YWluZXJBbmltYXRpb24uX2NhU2Nyb2xsRGlzdCAqIHNjcm9sbGVyTWF4O1xuXHQgIH1cblxuXHQgIGNvbnRhaW5lckFuaW1hdGlvbiAmJiBjb250YWluZXJBbmltYXRpb24uc2Vlayh0aW1lKTtcblx0ICByZXR1cm4gY29udGFpbmVyQW5pbWF0aW9uID8gdmFsdWUgOiBNYXRoLnJvdW5kKHZhbHVlKTtcblx0fSxcblx0ICAgIF9wcmVmaXhFeHAgPSAvKD86d2Via2l0fG1venxsZW5ndGh8Y3NzVGV4dHxpbnNldCkvaSxcblx0ICAgIF9yZXBhcmVudCA9IGZ1bmN0aW9uIF9yZXBhcmVudChlbGVtZW50LCBwYXJlbnQsIHRvcCwgbGVmdCkge1xuXHQgIGlmIChlbGVtZW50LnBhcmVudE5vZGUgIT09IHBhcmVudCkge1xuXHQgICAgdmFyIHN0eWxlID0gZWxlbWVudC5zdHlsZSxcblx0ICAgICAgICBwLFxuXHQgICAgICAgIGNzO1xuXG5cdCAgICBpZiAocGFyZW50ID09PSBfYm9keSkge1xuXHQgICAgICBlbGVtZW50Ll9zdE9yaWcgPSBzdHlsZS5jc3NUZXh0O1xuXHQgICAgICBjcyA9IF9nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuXG5cdCAgICAgIGZvciAocCBpbiBjcykge1xuXHQgICAgICAgIGlmICghK3AgJiYgIV9wcmVmaXhFeHAudGVzdChwKSAmJiBjc1twXSAmJiB0eXBlb2Ygc3R5bGVbcF0gPT09IFwic3RyaW5nXCIgJiYgcCAhPT0gXCIwXCIpIHtcblx0ICAgICAgICAgIHN0eWxlW3BdID0gY3NbcF07XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgc3R5bGUudG9wID0gdG9wO1xuXHQgICAgICBzdHlsZS5sZWZ0ID0gbGVmdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIHN0eWxlLmNzc1RleHQgPSBlbGVtZW50Ll9zdE9yaWc7XG5cdCAgICB9XG5cblx0ICAgIGdzYXAuY29yZS5nZXRDYWNoZShlbGVtZW50KS51bmNhY2hlID0gMTtcblx0ICAgIHBhcmVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcblx0ICB9XG5cdH0sXG5cdCAgICBfZ2V0VHdlZW5DcmVhdG9yID0gZnVuY3Rpb24gX2dldFR3ZWVuQ3JlYXRvcihzY3JvbGxlciwgZGlyZWN0aW9uKSB7XG5cdCAgdmFyIGdldFNjcm9sbCA9IF9nZXRTY3JvbGxGdW5jKHNjcm9sbGVyLCBkaXJlY3Rpb24pLFxuXHQgICAgICBwcm9wID0gXCJfc2Nyb2xsXCIgKyBkaXJlY3Rpb24ucDIsXG5cdCAgICAgIGxhc3RTY3JvbGwxLFxuXHQgICAgICBsYXN0U2Nyb2xsMixcblx0ICAgICAgZ2V0VHdlZW4gPSBmdW5jdGlvbiBnZXRUd2VlbihzY3JvbGxUbywgdmFycywgaW5pdGlhbFZhbHVlLCBjaGFuZ2UxLCBjaGFuZ2UyKSB7XG5cdCAgICB2YXIgdHdlZW4gPSBnZXRUd2Vlbi50d2Vlbixcblx0ICAgICAgICBvbkNvbXBsZXRlID0gdmFycy5vbkNvbXBsZXRlLFxuXHQgICAgICAgIG1vZGlmaWVycyA9IHt9O1xuXHQgICAgdHdlZW4gJiYgdHdlZW4ua2lsbCgpO1xuXHQgICAgbGFzdFNjcm9sbDEgPSBNYXRoLnJvdW5kKGluaXRpYWxWYWx1ZSk7XG5cdCAgICB2YXJzW3Byb3BdID0gc2Nyb2xsVG87XG5cdCAgICB2YXJzLm1vZGlmaWVycyA9IG1vZGlmaWVycztcblxuXHQgICAgbW9kaWZpZXJzW3Byb3BdID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgICAgIHZhbHVlID0gX3JvdW5kKGdldFNjcm9sbCgpKTtcblxuXHQgICAgICBpZiAodmFsdWUgIT09IGxhc3RTY3JvbGwxICYmIHZhbHVlICE9PSBsYXN0U2Nyb2xsMiAmJiBNYXRoLmFicyh2YWx1ZSAtIGxhc3RTY3JvbGwxKSA+IDIgJiYgTWF0aC5hYnModmFsdWUgLSBsYXN0U2Nyb2xsMikgPiAyKSB7XG5cdCAgICAgICAgdHdlZW4ua2lsbCgpO1xuXHQgICAgICAgIGdldFR3ZWVuLnR3ZWVuID0gMDtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICB2YWx1ZSA9IGluaXRpYWxWYWx1ZSArIGNoYW5nZTEgKiB0d2Vlbi5yYXRpbyArIGNoYW5nZTIgKiB0d2Vlbi5yYXRpbyAqIHR3ZWVuLnJhdGlvO1xuXHQgICAgICB9XG5cblx0ICAgICAgbGFzdFNjcm9sbDIgPSBsYXN0U2Nyb2xsMTtcblx0ICAgICAgcmV0dXJuIGxhc3RTY3JvbGwxID0gX3JvdW5kKHZhbHVlKTtcblx0ICAgIH07XG5cblx0ICAgIHZhcnMub25Db21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgZ2V0VHdlZW4udHdlZW4gPSAwO1xuXHQgICAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUuY2FsbCh0d2Vlbik7XG5cdCAgICB9O1xuXG5cdCAgICB0d2VlbiA9IGdldFR3ZWVuLnR3ZWVuID0gZ3NhcC50byhzY3JvbGxlciwgdmFycyk7XG5cdCAgICByZXR1cm4gdHdlZW47XG5cdCAgfTtcblxuXHQgIHNjcm9sbGVyW3Byb3BdID0gZ2V0U2Nyb2xsO1xuXG5cdCAgX2FkZExpc3RlbmVyKHNjcm9sbGVyLCBcIndoZWVsXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiBnZXRUd2Vlbi50d2VlbiAmJiBnZXRUd2Vlbi50d2Vlbi5raWxsKCkgJiYgKGdldFR3ZWVuLnR3ZWVuID0gMCk7XG5cdCAgfSk7XG5cblx0ICByZXR1cm4gZ2V0VHdlZW47XG5cdH07XG5cblx0X2hvcml6b250YWwub3AgPSBfdmVydGljYWw7XG5cdHZhciBTY3JvbGxUcmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuXHQgIGZ1bmN0aW9uIFNjcm9sbFRyaWdnZXIodmFycywgYW5pbWF0aW9uKSB7XG5cdCAgICBfY29yZUluaXR0ZWQgfHwgU2Nyb2xsVHJpZ2dlci5yZWdpc3Rlcihnc2FwKSB8fCBjb25zb2xlLndhcm4oXCJQbGVhc2UgZ3NhcC5yZWdpc3RlclBsdWdpbihTY3JvbGxUcmlnZ2VyKVwiKTtcblx0ICAgIHRoaXMuaW5pdCh2YXJzLCBhbmltYXRpb24pO1xuXHQgIH1cblxuXHQgIHZhciBfcHJvdG8gPSBTY3JvbGxUcmlnZ2VyLnByb3RvdHlwZTtcblxuXHQgIF9wcm90by5pbml0ID0gZnVuY3Rpb24gaW5pdCh2YXJzLCBhbmltYXRpb24pIHtcblx0ICAgIHRoaXMucHJvZ3Jlc3MgPSB0aGlzLnN0YXJ0ID0gMDtcblx0ICAgIHRoaXMudmFycyAmJiB0aGlzLmtpbGwoMSk7XG5cblx0ICAgIGlmICghX2VuYWJsZWQpIHtcblx0ICAgICAgdGhpcy51cGRhdGUgPSB0aGlzLnJlZnJlc2ggPSB0aGlzLmtpbGwgPSBfcGFzc1Rocm91Z2g7XG5cdCAgICAgIHJldHVybjtcblx0ICAgIH1cblxuXHQgICAgdmFycyA9IF9zZXREZWZhdWx0cyhfaXNTdHJpbmcodmFycykgfHwgX2lzTnVtYmVyKHZhcnMpIHx8IHZhcnMubm9kZVR5cGUgPyB7XG5cdCAgICAgIHRyaWdnZXI6IHZhcnNcblx0ICAgIH0gOiB2YXJzLCBfZGVmYXVsdHMpO1xuXG5cdCAgICB2YXIgX3ZhcnMgPSB2YXJzLFxuXHQgICAgICAgIG9uVXBkYXRlID0gX3ZhcnMub25VcGRhdGUsXG5cdCAgICAgICAgdG9nZ2xlQ2xhc3MgPSBfdmFycy50b2dnbGVDbGFzcyxcblx0ICAgICAgICBpZCA9IF92YXJzLmlkLFxuXHQgICAgICAgIG9uVG9nZ2xlID0gX3ZhcnMub25Ub2dnbGUsXG5cdCAgICAgICAgb25SZWZyZXNoID0gX3ZhcnMub25SZWZyZXNoLFxuXHQgICAgICAgIHNjcnViID0gX3ZhcnMuc2NydWIsXG5cdCAgICAgICAgdHJpZ2dlciA9IF92YXJzLnRyaWdnZXIsXG5cdCAgICAgICAgcGluID0gX3ZhcnMucGluLFxuXHQgICAgICAgIHBpblNwYWNpbmcgPSBfdmFycy5waW5TcGFjaW5nLFxuXHQgICAgICAgIGludmFsaWRhdGVPblJlZnJlc2ggPSBfdmFycy5pbnZhbGlkYXRlT25SZWZyZXNoLFxuXHQgICAgICAgIGFudGljaXBhdGVQaW4gPSBfdmFycy5hbnRpY2lwYXRlUGluLFxuXHQgICAgICAgIG9uU2NydWJDb21wbGV0ZSA9IF92YXJzLm9uU2NydWJDb21wbGV0ZSxcblx0ICAgICAgICBvblNuYXBDb21wbGV0ZSA9IF92YXJzLm9uU25hcENvbXBsZXRlLFxuXHQgICAgICAgIG9uY2UgPSBfdmFycy5vbmNlLFxuXHQgICAgICAgIHNuYXAgPSBfdmFycy5zbmFwLFxuXHQgICAgICAgIHBpblJlcGFyZW50ID0gX3ZhcnMucGluUmVwYXJlbnQsXG5cdCAgICAgICAgcGluU3BhY2VyID0gX3ZhcnMucGluU3BhY2VyLFxuXHQgICAgICAgIGNvbnRhaW5lckFuaW1hdGlvbiA9IF92YXJzLmNvbnRhaW5lckFuaW1hdGlvbixcblx0ICAgICAgICBmYXN0U2Nyb2xsRW5kID0gX3ZhcnMuZmFzdFNjcm9sbEVuZCxcblx0ICAgICAgICBwcmV2ZW50T3ZlcmxhcHMgPSBfdmFycy5wcmV2ZW50T3ZlcmxhcHMsXG5cdCAgICAgICAgZGlyZWN0aW9uID0gdmFycy5ob3Jpem9udGFsIHx8IHZhcnMuY29udGFpbmVyQW5pbWF0aW9uICYmIHZhcnMuaG9yaXpvbnRhbCAhPT0gZmFsc2UgPyBfaG9yaXpvbnRhbCA6IF92ZXJ0aWNhbCxcblx0ICAgICAgICBpc1RvZ2dsZSA9ICFzY3J1YiAmJiBzY3J1YiAhPT0gMCxcblx0ICAgICAgICBzY3JvbGxlciA9IF9nZXRUYXJnZXQodmFycy5zY3JvbGxlciB8fCBfd2luKSxcblx0ICAgICAgICBzY3JvbGxlckNhY2hlID0gZ3NhcC5jb3JlLmdldENhY2hlKHNjcm9sbGVyKSxcblx0ICAgICAgICBpc1ZpZXdwb3J0ID0gX2lzVmlld3BvcnQoc2Nyb2xsZXIpLFxuXHQgICAgICAgIHVzZUZpeGVkUG9zaXRpb24gPSAoXCJwaW5UeXBlXCIgaW4gdmFycyA/IHZhcnMucGluVHlwZSA6IF9nZXRQcm94eVByb3Aoc2Nyb2xsZXIsIFwicGluVHlwZVwiKSB8fCBpc1ZpZXdwb3J0ICYmIFwiZml4ZWRcIikgPT09IFwiZml4ZWRcIixcblx0ICAgICAgICBjYWxsYmFja3MgPSBbdmFycy5vbkVudGVyLCB2YXJzLm9uTGVhdmUsIHZhcnMub25FbnRlckJhY2ssIHZhcnMub25MZWF2ZUJhY2tdLFxuXHQgICAgICAgIHRvZ2dsZUFjdGlvbnMgPSBpc1RvZ2dsZSAmJiB2YXJzLnRvZ2dsZUFjdGlvbnMuc3BsaXQoXCIgXCIpLFxuXHQgICAgICAgIG1hcmtlcnMgPSBcIm1hcmtlcnNcIiBpbiB2YXJzID8gdmFycy5tYXJrZXJzIDogX2RlZmF1bHRzLm1hcmtlcnMsXG5cdCAgICAgICAgYm9yZGVyV2lkdGggPSBpc1ZpZXdwb3J0ID8gMCA6IHBhcnNlRmxvYXQoX2dldENvbXB1dGVkU3R5bGUoc2Nyb2xsZXIpW1wiYm9yZGVyXCIgKyBkaXJlY3Rpb24ucDIgKyBfV2lkdGhdKSB8fCAwLFxuXHQgICAgICAgIHNlbGYgPSB0aGlzLFxuXHQgICAgICAgIG9uUmVmcmVzaEluaXQgPSB2YXJzLm9uUmVmcmVzaEluaXQgJiYgZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gdmFycy5vblJlZnJlc2hJbml0KHNlbGYpO1xuXHQgICAgfSxcblx0ICAgICAgICBnZXRTY3JvbGxlclNpemUgPSBfZ2V0U2l6ZUZ1bmMoc2Nyb2xsZXIsIGlzVmlld3BvcnQsIGRpcmVjdGlvbiksXG5cdCAgICAgICAgZ2V0U2Nyb2xsZXJPZmZzZXRzID0gX2dldE9mZnNldHNGdW5jKHNjcm9sbGVyLCBpc1ZpZXdwb3J0KSxcblx0ICAgICAgICBsYXN0U25hcCA9IDAsXG5cdCAgICAgICAgc2Nyb2xsRnVuYyA9IF9nZXRTY3JvbGxGdW5jKHNjcm9sbGVyLCBkaXJlY3Rpb24pLFxuXHQgICAgICAgIHR3ZWVuVG8sXG5cdCAgICAgICAgcGluQ2FjaGUsXG5cdCAgICAgICAgc25hcEZ1bmMsXG5cdCAgICAgICAgc2Nyb2xsMSxcblx0ICAgICAgICBzY3JvbGwyLFxuXHQgICAgICAgIHN0YXJ0LFxuXHQgICAgICAgIGVuZCxcblx0ICAgICAgICBtYXJrZXJTdGFydCxcblx0ICAgICAgICBtYXJrZXJFbmQsXG5cdCAgICAgICAgbWFya2VyU3RhcnRUcmlnZ2VyLFxuXHQgICAgICAgIG1hcmtlckVuZFRyaWdnZXIsXG5cdCAgICAgICAgbWFya2VyVmFycyxcblx0ICAgICAgICBjaGFuZ2UsXG5cdCAgICAgICAgcGluT3JpZ2luYWxTdGF0ZSxcblx0ICAgICAgICBwaW5BY3RpdmVTdGF0ZSxcblx0ICAgICAgICBwaW5TdGF0ZSxcblx0ICAgICAgICBzcGFjZXIsXG5cdCAgICAgICAgb2Zmc2V0LFxuXHQgICAgICAgIHBpbkdldHRlcixcblx0ICAgICAgICBwaW5TZXR0ZXIsXG5cdCAgICAgICAgcGluU3RhcnQsXG5cdCAgICAgICAgcGluQ2hhbmdlLFxuXHQgICAgICAgIHNwYWNpbmdTdGFydCxcblx0ICAgICAgICBzcGFjZXJTdGF0ZSxcblx0ICAgICAgICBtYXJrZXJTdGFydFNldHRlcixcblx0ICAgICAgICBtYXJrZXJFbmRTZXR0ZXIsXG5cdCAgICAgICAgY3MsXG5cdCAgICAgICAgc25hcDEsXG5cdCAgICAgICAgc25hcDIsXG5cdCAgICAgICAgc2NydWJUd2Vlbixcblx0ICAgICAgICBzY3J1YlNtb290aCxcblx0ICAgICAgICBzbmFwRHVyQ2xhbXAsXG5cdCAgICAgICAgc25hcERlbGF5ZWRDYWxsLFxuXHQgICAgICAgIHByZXZQcm9ncmVzcyxcblx0ICAgICAgICBwcmV2U2Nyb2xsLFxuXHQgICAgICAgIHByZXZBbmltUHJvZ3Jlc3MsXG5cdCAgICAgICAgY2FNYXJrZXJTZXR0ZXI7XG5cblx0ICAgIHNlbGYubWVkaWEgPSBfY3JlYXRpbmdNZWRpYTtcblx0ICAgIHNlbGYuX2RpciA9IGRpcmVjdGlvbjtcblx0ICAgIGFudGljaXBhdGVQaW4gKj0gNDU7XG5cdCAgICBzZWxmLnNjcm9sbGVyID0gc2Nyb2xsZXI7XG5cdCAgICBzZWxmLnNjcm9sbCA9IGNvbnRhaW5lckFuaW1hdGlvbiA/IGNvbnRhaW5lckFuaW1hdGlvbi50aW1lLmJpbmQoY29udGFpbmVyQW5pbWF0aW9uKSA6IHNjcm9sbEZ1bmM7XG5cdCAgICBzY3JvbGwxID0gc2Nyb2xsRnVuYygpO1xuXHQgICAgc2VsZi52YXJzID0gdmFycztcblx0ICAgIGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8fCB2YXJzLmFuaW1hdGlvbjtcblx0ICAgIFwicmVmcmVzaFByaW9yaXR5XCIgaW4gdmFycyAmJiAoX3NvcnQgPSAxKTtcblx0ICAgIHNjcm9sbGVyQ2FjaGUudHdlZW5TY3JvbGwgPSBzY3JvbGxlckNhY2hlLnR3ZWVuU2Nyb2xsIHx8IHtcblx0ICAgICAgdG9wOiBfZ2V0VHdlZW5DcmVhdG9yKHNjcm9sbGVyLCBfdmVydGljYWwpLFxuXHQgICAgICBsZWZ0OiBfZ2V0VHdlZW5DcmVhdG9yKHNjcm9sbGVyLCBfaG9yaXpvbnRhbClcblx0ICAgIH07XG5cdCAgICBzZWxmLnR3ZWVuVG8gPSB0d2VlblRvID0gc2Nyb2xsZXJDYWNoZS50d2VlblNjcm9sbFtkaXJlY3Rpb24ucF07XG5cblx0ICAgIGlmIChhbmltYXRpb24pIHtcblx0ICAgICAgYW5pbWF0aW9uLnZhcnMubGF6eSA9IGZhbHNlO1xuXHQgICAgICBhbmltYXRpb24uX2luaXR0ZWQgfHwgYW5pbWF0aW9uLnZhcnMuaW1tZWRpYXRlUmVuZGVyICE9PSBmYWxzZSAmJiB2YXJzLmltbWVkaWF0ZVJlbmRlciAhPT0gZmFsc2UgJiYgYW5pbWF0aW9uLnJlbmRlcigwLCB0cnVlLCB0cnVlKTtcblx0ICAgICAgc2VsZi5hbmltYXRpb24gPSBhbmltYXRpb24ucGF1c2UoKTtcblx0ICAgICAgYW5pbWF0aW9uLnNjcm9sbFRyaWdnZXIgPSBzZWxmO1xuXHQgICAgICBzY3J1YlNtb290aCA9IF9pc051bWJlcihzY3J1YikgJiYgc2NydWI7XG5cdCAgICAgIHNjcnViU21vb3RoICYmIChzY3J1YlR3ZWVuID0gZ3NhcC50byhhbmltYXRpb24sIHtcblx0ICAgICAgICBlYXNlOiBcInBvd2VyM1wiLFxuXHQgICAgICAgIGR1cmF0aW9uOiBzY3J1YlNtb290aCxcblx0ICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiBvbkNvbXBsZXRlKCkge1xuXHQgICAgICAgICAgcmV0dXJuIG9uU2NydWJDb21wbGV0ZSAmJiBvblNjcnViQ29tcGxldGUoc2VsZik7XG5cdCAgICAgICAgfVxuXHQgICAgICB9KSk7XG5cdCAgICAgIHNuYXAxID0gMDtcblx0ICAgICAgaWQgfHwgKGlkID0gYW5pbWF0aW9uLnZhcnMuaWQpO1xuXHQgICAgfVxuXG5cdCAgICBfdHJpZ2dlcnMucHVzaChzZWxmKTtcblxuXHQgICAgaWYgKHNuYXApIHtcblx0ICAgICAgaWYgKCFfaXNPYmplY3Qoc25hcCkgfHwgc25hcC5wdXNoKSB7XG5cdCAgICAgICAgc25hcCA9IHtcblx0ICAgICAgICAgIHNuYXBUbzogc25hcFxuXHQgICAgICAgIH07XG5cdCAgICAgIH1cblxuXHQgICAgICBcInNjcm9sbEJlaGF2aW9yXCIgaW4gX2JvZHkuc3R5bGUgJiYgZ3NhcC5zZXQoaXNWaWV3cG9ydCA/IFtfYm9keSwgX2RvY0VsXSA6IHNjcm9sbGVyLCB7XG5cdCAgICAgICAgc2Nyb2xsQmVoYXZpb3I6IFwiYXV0b1wiXG5cdCAgICAgIH0pO1xuXHQgICAgICBzbmFwRnVuYyA9IF9pc0Z1bmN0aW9uKHNuYXAuc25hcFRvKSA/IHNuYXAuc25hcFRvIDogc25hcC5zbmFwVG8gPT09IFwibGFiZWxzXCIgPyBfZ2V0Q2xvc2VzdExhYmVsKGFuaW1hdGlvbikgOiBzbmFwLnNuYXBUbyA9PT0gXCJsYWJlbHNEaXJlY3Rpb25hbFwiID8gX2dldExhYmVsQXREaXJlY3Rpb24oYW5pbWF0aW9uKSA6IHNuYXAuZGlyZWN0aW9uYWwgIT09IGZhbHNlID8gZnVuY3Rpb24gKHZhbHVlLCBzdCkge1xuXHQgICAgICAgIHJldHVybiBfc25hcERpcmVjdGlvbmFsKHNuYXAuc25hcFRvKSh2YWx1ZSwgc3QuZGlyZWN0aW9uKTtcblx0ICAgICAgfSA6IGdzYXAudXRpbHMuc25hcChzbmFwLnNuYXBUbyk7XG5cdCAgICAgIHNuYXBEdXJDbGFtcCA9IHNuYXAuZHVyYXRpb24gfHwge1xuXHQgICAgICAgIG1pbjogMC4xLFxuXHQgICAgICAgIG1heDogMlxuXHQgICAgICB9O1xuXHQgICAgICBzbmFwRHVyQ2xhbXAgPSBfaXNPYmplY3Qoc25hcER1ckNsYW1wKSA/IF9jbGFtcChzbmFwRHVyQ2xhbXAubWluLCBzbmFwRHVyQ2xhbXAubWF4KSA6IF9jbGFtcChzbmFwRHVyQ2xhbXAsIHNuYXBEdXJDbGFtcCk7XG5cdCAgICAgIHNuYXBEZWxheWVkQ2FsbCA9IGdzYXAuZGVsYXllZENhbGwoc25hcC5kZWxheSB8fCBzY3J1YlNtb290aCAvIDIgfHwgMC4xLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgaWYgKE1hdGguYWJzKHNlbGYuZ2V0VmVsb2NpdHkoKSkgPCAxMCAmJiAhX3BvaW50ZXJJc0Rvd24gJiYgbGFzdFNuYXAgIT09IHNjcm9sbEZ1bmMoKSkge1xuXHQgICAgICAgICAgdmFyIHRvdGFsUHJvZ3Jlc3MgPSBhbmltYXRpb24gJiYgIWlzVG9nZ2xlID8gYW5pbWF0aW9uLnRvdGFsUHJvZ3Jlc3MoKSA6IHNlbGYucHJvZ3Jlc3MsXG5cdCAgICAgICAgICAgICAgdmVsb2NpdHkgPSAodG90YWxQcm9ncmVzcyAtIHNuYXAyKSAvIChfZ2V0VGltZSgpIC0gX3RpbWUyKSAqIDEwMDAgfHwgMCxcblx0ICAgICAgICAgICAgICBjaGFuZ2UxID0gZ3NhcC51dGlscy5jbGFtcCgtc2VsZi5wcm9ncmVzcywgMSAtIHNlbGYucHJvZ3Jlc3MsIF9hYnModmVsb2NpdHkgLyAyKSAqIHZlbG9jaXR5IC8gMC4xODUpLFxuXHQgICAgICAgICAgICAgIG5hdHVyYWxFbmQgPSBzZWxmLnByb2dyZXNzICsgKHNuYXAuaW5lcnRpYSA9PT0gZmFsc2UgPyAwIDogY2hhbmdlMSksXG5cdCAgICAgICAgICAgICAgZW5kVmFsdWUgPSBfY2xhbXAoMCwgMSwgc25hcEZ1bmMobmF0dXJhbEVuZCwgc2VsZikpLFxuXHQgICAgICAgICAgICAgIHNjcm9sbCA9IHNjcm9sbEZ1bmMoKSxcblx0ICAgICAgICAgICAgICBlbmRTY3JvbGwgPSBNYXRoLnJvdW5kKHN0YXJ0ICsgZW5kVmFsdWUgKiBjaGFuZ2UpLFxuXHQgICAgICAgICAgICAgIF9zbmFwID0gc25hcCxcblx0ICAgICAgICAgICAgICBvblN0YXJ0ID0gX3NuYXAub25TdGFydCxcblx0ICAgICAgICAgICAgICBfb25JbnRlcnJ1cHQgPSBfc25hcC5vbkludGVycnVwdCxcblx0ICAgICAgICAgICAgICBfb25Db21wbGV0ZSA9IF9zbmFwLm9uQ29tcGxldGUsXG5cdCAgICAgICAgICAgICAgdHdlZW4gPSB0d2VlblRvLnR3ZWVuO1xuXG5cdCAgICAgICAgICBpZiAoc2Nyb2xsIDw9IGVuZCAmJiBzY3JvbGwgPj0gc3RhcnQgJiYgZW5kU2Nyb2xsICE9PSBzY3JvbGwpIHtcblx0ICAgICAgICAgICAgaWYgKHR3ZWVuICYmICF0d2Vlbi5faW5pdHRlZCAmJiB0d2Vlbi5kYXRhIDw9IF9hYnMoZW5kU2Nyb2xsIC0gc2Nyb2xsKSkge1xuXHQgICAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIGlmIChzbmFwLmluZXJ0aWEgPT09IGZhbHNlKSB7XG5cdCAgICAgICAgICAgICAgY2hhbmdlMSA9IGVuZFZhbHVlIC0gc2VsZi5wcm9ncmVzcztcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHR3ZWVuVG8oZW5kU2Nyb2xsLCB7XG5cdCAgICAgICAgICAgICAgZHVyYXRpb246IHNuYXBEdXJDbGFtcChfYWJzKE1hdGgubWF4KF9hYnMobmF0dXJhbEVuZCAtIHRvdGFsUHJvZ3Jlc3MpLCBfYWJzKGVuZFZhbHVlIC0gdG90YWxQcm9ncmVzcykpICogMC4xODUgLyB2ZWxvY2l0eSAvIDAuMDUgfHwgMCkpLFxuXHQgICAgICAgICAgICAgIGVhc2U6IHNuYXAuZWFzZSB8fCBcInBvd2VyM1wiLFxuXHQgICAgICAgICAgICAgIGRhdGE6IF9hYnMoZW5kU2Nyb2xsIC0gc2Nyb2xsKSxcblx0ICAgICAgICAgICAgICBvbkludGVycnVwdDogZnVuY3Rpb24gb25JbnRlcnJ1cHQoKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc25hcERlbGF5ZWRDYWxsLnJlc3RhcnQodHJ1ZSkgJiYgX29uSW50ZXJydXB0ICYmIF9vbkludGVycnVwdChzZWxmKTtcblx0ICAgICAgICAgICAgICB9LFxuXHQgICAgICAgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uIG9uQ29tcGxldGUoKSB7XG5cdCAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZSgpO1xuXHQgICAgICAgICAgICAgICAgbGFzdFNuYXAgPSBzY3JvbGxGdW5jKCk7XG5cdCAgICAgICAgICAgICAgICBzbmFwMSA9IHNuYXAyID0gYW5pbWF0aW9uICYmICFpc1RvZ2dsZSA/IGFuaW1hdGlvbi50b3RhbFByb2dyZXNzKCkgOiBzZWxmLnByb2dyZXNzO1xuXHQgICAgICAgICAgICAgICAgb25TbmFwQ29tcGxldGUgJiYgb25TbmFwQ29tcGxldGUoc2VsZik7XG5cdCAgICAgICAgICAgICAgICBfb25Db21wbGV0ZSAmJiBfb25Db21wbGV0ZShzZWxmKTtcblx0ICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0sIHNjcm9sbCwgY2hhbmdlMSAqIGNoYW5nZSwgZW5kU2Nyb2xsIC0gc2Nyb2xsIC0gY2hhbmdlMSAqIGNoYW5nZSk7XG5cdCAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydChzZWxmLCB0d2VlblRvLnR3ZWVuKTtcblx0ICAgICAgICAgIH1cblx0ICAgICAgICB9IGVsc2UgaWYgKHNlbGYuaXNBY3RpdmUpIHtcblx0ICAgICAgICAgIHNuYXBEZWxheWVkQ2FsbC5yZXN0YXJ0KHRydWUpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfSkucGF1c2UoKTtcblx0ICAgIH1cblxuXHQgICAgaWQgJiYgKF9pZHNbaWRdID0gc2VsZik7XG5cdCAgICB0cmlnZ2VyID0gc2VsZi50cmlnZ2VyID0gX2dldFRhcmdldCh0cmlnZ2VyIHx8IHBpbik7XG5cdCAgICBwaW4gPSBwaW4gPT09IHRydWUgPyB0cmlnZ2VyIDogX2dldFRhcmdldChwaW4pO1xuXHQgICAgX2lzU3RyaW5nKHRvZ2dsZUNsYXNzKSAmJiAodG9nZ2xlQ2xhc3MgPSB7XG5cdCAgICAgIHRhcmdldHM6IHRyaWdnZXIsXG5cdCAgICAgIGNsYXNzTmFtZTogdG9nZ2xlQ2xhc3Ncblx0ICAgIH0pO1xuXG5cdCAgICBpZiAocGluKSB7XG5cdCAgICAgIHBpblNwYWNpbmcgPT09IGZhbHNlIHx8IHBpblNwYWNpbmcgPT09IF9tYXJnaW4gfHwgKHBpblNwYWNpbmcgPSAhcGluU3BhY2luZyAmJiBfZ2V0Q29tcHV0ZWRTdHlsZShwaW4ucGFyZW50Tm9kZSkuZGlzcGxheSA9PT0gXCJmbGV4XCIgPyBmYWxzZSA6IF9wYWRkaW5nKTtcblx0ICAgICAgc2VsZi5waW4gPSBwaW47XG5cdCAgICAgIHZhcnMuZm9yY2UzRCAhPT0gZmFsc2UgJiYgZ3NhcC5zZXQocGluLCB7XG5cdCAgICAgICAgZm9yY2UzRDogdHJ1ZVxuXHQgICAgICB9KTtcblx0ICAgICAgcGluQ2FjaGUgPSBnc2FwLmNvcmUuZ2V0Q2FjaGUocGluKTtcblxuXHQgICAgICBpZiAoIXBpbkNhY2hlLnNwYWNlcikge1xuXHQgICAgICAgIGlmIChwaW5TcGFjZXIpIHtcblx0ICAgICAgICAgIHBpblNwYWNlciA9IF9nZXRUYXJnZXQocGluU3BhY2VyKTtcblx0ICAgICAgICAgIHBpblNwYWNlciAmJiAhcGluU3BhY2VyLm5vZGVUeXBlICYmIChwaW5TcGFjZXIgPSBwaW5TcGFjZXIuY3VycmVudCB8fCBwaW5TcGFjZXIubmF0aXZlRWxlbWVudCk7XG5cdCAgICAgICAgICBwaW5DYWNoZS5zcGFjZXJJc05hdGl2ZSA9ICEhcGluU3BhY2VyO1xuXHQgICAgICAgICAgcGluU3BhY2VyICYmIChwaW5DYWNoZS5zcGFjZXJTdGF0ZSA9IF9nZXRTdGF0ZShwaW5TcGFjZXIpKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBwaW5DYWNoZS5zcGFjZXIgPSBzcGFjZXIgPSBwaW5TcGFjZXIgfHwgX2RvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHQgICAgICAgIHNwYWNlci5jbGFzc0xpc3QuYWRkKFwicGluLXNwYWNlclwiKTtcblx0ICAgICAgICBpZCAmJiBzcGFjZXIuY2xhc3NMaXN0LmFkZChcInBpbi1zcGFjZXItXCIgKyBpZCk7XG5cdCAgICAgICAgcGluQ2FjaGUucGluU3RhdGUgPSBwaW5PcmlnaW5hbFN0YXRlID0gX2dldFN0YXRlKHBpbik7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgcGluT3JpZ2luYWxTdGF0ZSA9IHBpbkNhY2hlLnBpblN0YXRlO1xuXHQgICAgICB9XG5cblx0ICAgICAgc2VsZi5zcGFjZXIgPSBzcGFjZXIgPSBwaW5DYWNoZS5zcGFjZXI7XG5cdCAgICAgIGNzID0gX2dldENvbXB1dGVkU3R5bGUocGluKTtcblx0ICAgICAgc3BhY2luZ1N0YXJ0ID0gY3NbcGluU3BhY2luZyArIGRpcmVjdGlvbi5vczJdO1xuXHQgICAgICBwaW5HZXR0ZXIgPSBnc2FwLmdldFByb3BlcnR5KHBpbik7XG5cdCAgICAgIHBpblNldHRlciA9IGdzYXAucXVpY2tTZXR0ZXIocGluLCBkaXJlY3Rpb24uYSwgX3B4KTtcblxuXHQgICAgICBfc3dhcFBpbkluKHBpbiwgc3BhY2VyLCBjcyk7XG5cblx0ICAgICAgcGluU3RhdGUgPSBfZ2V0U3RhdGUocGluKTtcblx0ICAgIH1cblxuXHQgICAgaWYgKG1hcmtlcnMpIHtcblx0ICAgICAgbWFya2VyVmFycyA9IF9pc09iamVjdChtYXJrZXJzKSA/IF9zZXREZWZhdWx0cyhtYXJrZXJzLCBfbWFya2VyRGVmYXVsdHMpIDogX21hcmtlckRlZmF1bHRzO1xuXHQgICAgICBtYXJrZXJTdGFydFRyaWdnZXIgPSBfY3JlYXRlTWFya2VyKFwic2Nyb2xsZXItc3RhcnRcIiwgaWQsIHNjcm9sbGVyLCBkaXJlY3Rpb24sIG1hcmtlclZhcnMsIDApO1xuXHQgICAgICBtYXJrZXJFbmRUcmlnZ2VyID0gX2NyZWF0ZU1hcmtlcihcInNjcm9sbGVyLWVuZFwiLCBpZCwgc2Nyb2xsZXIsIGRpcmVjdGlvbiwgbWFya2VyVmFycywgMCwgbWFya2VyU3RhcnRUcmlnZ2VyKTtcblx0ICAgICAgb2Zmc2V0ID0gbWFya2VyU3RhcnRUcmlnZ2VyW1wib2Zmc2V0XCIgKyBkaXJlY3Rpb24ub3AuZDJdO1xuXHQgICAgICBtYXJrZXJTdGFydCA9IF9jcmVhdGVNYXJrZXIoXCJzdGFydFwiLCBpZCwgc2Nyb2xsZXIsIGRpcmVjdGlvbiwgbWFya2VyVmFycywgb2Zmc2V0LCAwLCBjb250YWluZXJBbmltYXRpb24pO1xuXHQgICAgICBtYXJrZXJFbmQgPSBfY3JlYXRlTWFya2VyKFwiZW5kXCIsIGlkLCBzY3JvbGxlciwgZGlyZWN0aW9uLCBtYXJrZXJWYXJzLCBvZmZzZXQsIDAsIGNvbnRhaW5lckFuaW1hdGlvbik7XG5cdCAgICAgIGNvbnRhaW5lckFuaW1hdGlvbiAmJiAoY2FNYXJrZXJTZXR0ZXIgPSBnc2FwLnF1aWNrU2V0dGVyKFttYXJrZXJTdGFydCwgbWFya2VyRW5kXSwgZGlyZWN0aW9uLmEsIF9weCkpO1xuXG5cdCAgICAgIGlmICghdXNlRml4ZWRQb3NpdGlvbiAmJiAhKF9wcm94aWVzLmxlbmd0aCAmJiBfZ2V0UHJveHlQcm9wKHNjcm9sbGVyLCBcImZpeGVkTWFya2Vyc1wiKSA9PT0gdHJ1ZSkpIHtcblx0ICAgICAgICBfbWFrZVBvc2l0aW9uYWJsZShpc1ZpZXdwb3J0ID8gX2JvZHkgOiBzY3JvbGxlcik7XG5cblx0ICAgICAgICBnc2FwLnNldChbbWFya2VyU3RhcnRUcmlnZ2VyLCBtYXJrZXJFbmRUcmlnZ2VyXSwge1xuXHQgICAgICAgICAgZm9yY2UzRDogdHJ1ZVxuXHQgICAgICAgIH0pO1xuXHQgICAgICAgIG1hcmtlclN0YXJ0U2V0dGVyID0gZ3NhcC5xdWlja1NldHRlcihtYXJrZXJTdGFydFRyaWdnZXIsIGRpcmVjdGlvbi5hLCBfcHgpO1xuXHQgICAgICAgIG1hcmtlckVuZFNldHRlciA9IGdzYXAucXVpY2tTZXR0ZXIobWFya2VyRW5kVHJpZ2dlciwgZGlyZWN0aW9uLmEsIF9weCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgaWYgKGNvbnRhaW5lckFuaW1hdGlvbikge1xuXHQgICAgICB2YXIgb2xkT25VcGRhdGUgPSBjb250YWluZXJBbmltYXRpb24udmFycy5vblVwZGF0ZSxcblx0ICAgICAgICAgIG9sZFBhcmFtcyA9IGNvbnRhaW5lckFuaW1hdGlvbi52YXJzLm9uVXBkYXRlUGFyYW1zO1xuXHQgICAgICBjb250YWluZXJBbmltYXRpb24uZXZlbnRDYWxsYmFjayhcIm9uVXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBzZWxmLnVwZGF0ZSgwLCAwLCAxKTtcblx0ICAgICAgICBvbGRPblVwZGF0ZSAmJiBvbGRPblVwZGF0ZS5hcHBseShvbGRQYXJhbXMgfHwgW10pO1xuXHQgICAgICB9KTtcblx0ICAgIH1cblxuXHQgICAgc2VsZi5wcmV2aW91cyA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgcmV0dXJuIF90cmlnZ2Vyc1tfdHJpZ2dlcnMuaW5kZXhPZihzZWxmKSAtIDFdO1xuXHQgICAgfTtcblxuXHQgICAgc2VsZi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gX3RyaWdnZXJzW190cmlnZ2Vycy5pbmRleE9mKHNlbGYpICsgMV07XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLnJldmVydCA9IGZ1bmN0aW9uIChyZXZlcnQpIHtcblx0ICAgICAgdmFyIHIgPSByZXZlcnQgIT09IGZhbHNlIHx8ICFzZWxmLmVuYWJsZWQsXG5cdCAgICAgICAgICBwcmV2UmVmcmVzaGluZyA9IF9yZWZyZXNoaW5nO1xuXG5cdCAgICAgIGlmIChyICE9PSBzZWxmLmlzUmV2ZXJ0ZWQpIHtcblx0ICAgICAgICBpZiAocikge1xuXHQgICAgICAgICAgc2VsZi5zY3JvbGwucmVjIHx8IChzZWxmLnNjcm9sbC5yZWMgPSBzY3JvbGxGdW5jKCkpO1xuXHQgICAgICAgICAgcHJldlNjcm9sbCA9IE1hdGgubWF4KHNjcm9sbEZ1bmMoKSwgc2VsZi5zY3JvbGwucmVjIHx8IDApO1xuXHQgICAgICAgICAgcHJldlByb2dyZXNzID0gc2VsZi5wcm9ncmVzcztcblx0ICAgICAgICAgIHByZXZBbmltUHJvZ3Jlc3MgPSBhbmltYXRpb24gJiYgYW5pbWF0aW9uLnByb2dyZXNzKCk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgbWFya2VyU3RhcnQgJiYgW21hcmtlclN0YXJ0LCBtYXJrZXJFbmQsIG1hcmtlclN0YXJ0VHJpZ2dlciwgbWFya2VyRW5kVHJpZ2dlcl0uZm9yRWFjaChmdW5jdGlvbiAobSkge1xuXHQgICAgICAgICAgcmV0dXJuIG0uc3R5bGUuZGlzcGxheSA9IHIgPyBcIm5vbmVcIiA6IFwiYmxvY2tcIjtcblx0ICAgICAgICB9KTtcblx0ICAgICAgICByICYmIChfcmVmcmVzaGluZyA9IDEpO1xuXHQgICAgICAgIHNlbGYudXBkYXRlKHIpO1xuXHQgICAgICAgIF9yZWZyZXNoaW5nID0gcHJldlJlZnJlc2hpbmc7XG5cdCAgICAgICAgcGluICYmIChyID8gX3N3YXBQaW5PdXQocGluLCBzcGFjZXIsIHBpbk9yaWdpbmFsU3RhdGUpIDogKCFwaW5SZXBhcmVudCB8fCAhc2VsZi5pc0FjdGl2ZSkgJiYgX3N3YXBQaW5JbihwaW4sIHNwYWNlciwgX2dldENvbXB1dGVkU3R5bGUocGluKSwgc3BhY2VyU3RhdGUpKTtcblx0ICAgICAgICBzZWxmLmlzUmV2ZXJ0ZWQgPSByO1xuXHQgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLnJlZnJlc2ggPSBmdW5jdGlvbiAoc29mdCwgZm9yY2UpIHtcblx0ICAgICAgaWYgKChfcmVmcmVzaGluZyB8fCAhc2VsZi5lbmFibGVkKSAmJiAhZm9yY2UpIHtcblx0ICAgICAgICByZXR1cm47XG5cdCAgICAgIH1cblxuXHQgICAgICBpZiAocGluICYmIHNvZnQgJiYgX2xhc3RTY3JvbGxUaW1lKSB7XG5cdCAgICAgICAgX2FkZExpc3RlbmVyKFNjcm9sbFRyaWdnZXIsIFwic2Nyb2xsRW5kXCIsIF9zb2Z0UmVmcmVzaCk7XG5cblx0ICAgICAgICByZXR1cm47XG5cdCAgICAgIH1cblxuXHQgICAgICBfcmVmcmVzaGluZyA9IDE7XG5cdCAgICAgIHNjcnViVHdlZW4gJiYgc2NydWJUd2Vlbi5wYXVzZSgpO1xuXHQgICAgICBpbnZhbGlkYXRlT25SZWZyZXNoICYmIGFuaW1hdGlvbiAmJiBhbmltYXRpb24udGltZSgtMC4wMSwgdHJ1ZSkuaW52YWxpZGF0ZSgpO1xuXHQgICAgICBzZWxmLmlzUmV2ZXJ0ZWQgfHwgc2VsZi5yZXZlcnQoKTtcblxuXHQgICAgICB2YXIgc2l6ZSA9IGdldFNjcm9sbGVyU2l6ZSgpLFxuXHQgICAgICAgICAgc2Nyb2xsZXJCb3VuZHMgPSBnZXRTY3JvbGxlck9mZnNldHMoKSxcblx0ICAgICAgICAgIG1heCA9IGNvbnRhaW5lckFuaW1hdGlvbiA/IGNvbnRhaW5lckFuaW1hdGlvbi5kdXJhdGlvbigpIDogX21heFNjcm9sbChzY3JvbGxlciwgZGlyZWN0aW9uKSxcblx0ICAgICAgICAgIG9mZnNldCA9IDAsXG5cdCAgICAgICAgICBvdGhlclBpbk9mZnNldCA9IDAsXG5cdCAgICAgICAgICBwYXJzZWRFbmQgPSB2YXJzLmVuZCxcblx0ICAgICAgICAgIHBhcnNlZEVuZFRyaWdnZXIgPSB2YXJzLmVuZFRyaWdnZXIgfHwgdHJpZ2dlcixcblx0ICAgICAgICAgIHBhcnNlZFN0YXJ0ID0gdmFycy5zdGFydCB8fCAodmFycy5zdGFydCA9PT0gMCB8fCAhdHJpZ2dlciA/IDAgOiBwaW4gPyBcIjAgMFwiIDogXCIwIDEwMCVcIiksXG5cdCAgICAgICAgICBwaW5uZWRDb250YWluZXIgPSB2YXJzLnBpbm5lZENvbnRhaW5lciAmJiBfZ2V0VGFyZ2V0KHZhcnMucGlubmVkQ29udGFpbmVyKSxcblx0ICAgICAgICAgIHRyaWdnZXJJbmRleCA9IHRyaWdnZXIgJiYgTWF0aC5tYXgoMCwgX3RyaWdnZXJzLmluZGV4T2Yoc2VsZikpIHx8IDAsXG5cdCAgICAgICAgICBpID0gdHJpZ2dlckluZGV4LFxuXHQgICAgICAgICAgY3MsXG5cdCAgICAgICAgICBib3VuZHMsXG5cdCAgICAgICAgICBzY3JvbGwsXG5cdCAgICAgICAgICBpc1ZlcnRpY2FsLFxuXHQgICAgICAgICAgb3ZlcnJpZGUsXG5cdCAgICAgICAgICBjdXJUcmlnZ2VyLFxuXHQgICAgICAgICAgY3VyUGluLFxuXHQgICAgICAgICAgb3Bwb3NpdGVTY3JvbGwsXG5cdCAgICAgICAgICBpbml0dGVkLFxuXHQgICAgICAgICAgcmV2ZXJ0ZWRQaW5zO1xuXG5cdCAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICBjdXJUcmlnZ2VyID0gX3RyaWdnZXJzW2ldO1xuXHQgICAgICAgIGN1clRyaWdnZXIuZW5kIHx8IGN1clRyaWdnZXIucmVmcmVzaCgwLCAxKSB8fCAoX3JlZnJlc2hpbmcgPSAxKTtcblx0ICAgICAgICBjdXJQaW4gPSBjdXJUcmlnZ2VyLnBpbjtcblxuXHQgICAgICAgIGlmIChjdXJQaW4gJiYgKGN1clBpbiA9PT0gdHJpZ2dlciB8fCBjdXJQaW4gPT09IHBpbikgJiYgIWN1clRyaWdnZXIuaXNSZXZlcnRlZCkge1xuXHQgICAgICAgICAgcmV2ZXJ0ZWRQaW5zIHx8IChyZXZlcnRlZFBpbnMgPSBbXSk7XG5cdCAgICAgICAgICByZXZlcnRlZFBpbnMudW5zaGlmdChjdXJUcmlnZ2VyKTtcblx0ICAgICAgICAgIGN1clRyaWdnZXIucmV2ZXJ0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgX2lzRnVuY3Rpb24ocGFyc2VkU3RhcnQpICYmIChwYXJzZWRTdGFydCA9IHBhcnNlZFN0YXJ0KHNlbGYpKTtcblx0ICAgICAgc3RhcnQgPSBfcGFyc2VQb3NpdGlvbihwYXJzZWRTdGFydCwgdHJpZ2dlciwgc2l6ZSwgZGlyZWN0aW9uLCBzY3JvbGxGdW5jKCksIG1hcmtlclN0YXJ0LCBtYXJrZXJTdGFydFRyaWdnZXIsIHNlbGYsIHNjcm9sbGVyQm91bmRzLCBib3JkZXJXaWR0aCwgdXNlRml4ZWRQb3NpdGlvbiwgbWF4LCBjb250YWluZXJBbmltYXRpb24pIHx8IChwaW4gPyAtMC4wMDEgOiAwKTtcblx0ICAgICAgX2lzRnVuY3Rpb24ocGFyc2VkRW5kKSAmJiAocGFyc2VkRW5kID0gcGFyc2VkRW5kKHNlbGYpKTtcblxuXHQgICAgICBpZiAoX2lzU3RyaW5nKHBhcnNlZEVuZCkgJiYgIXBhcnNlZEVuZC5pbmRleE9mKFwiKz1cIikpIHtcblx0ICAgICAgICBpZiAofnBhcnNlZEVuZC5pbmRleE9mKFwiIFwiKSkge1xuXHQgICAgICAgICAgcGFyc2VkRW5kID0gKF9pc1N0cmluZyhwYXJzZWRTdGFydCkgPyBwYXJzZWRTdGFydC5zcGxpdChcIiBcIilbMF0gOiBcIlwiKSArIHBhcnNlZEVuZDtcblx0ICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgb2Zmc2V0ID0gX29mZnNldFRvUHgocGFyc2VkRW5kLnN1YnN0cigyKSwgc2l6ZSk7XG5cdCAgICAgICAgICBwYXJzZWRFbmQgPSBfaXNTdHJpbmcocGFyc2VkU3RhcnQpID8gcGFyc2VkU3RhcnQgOiBzdGFydCArIG9mZnNldDtcblx0ICAgICAgICAgIHBhcnNlZEVuZFRyaWdnZXIgPSB0cmlnZ2VyO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXG5cdCAgICAgIGVuZCA9IE1hdGgubWF4KHN0YXJ0LCBfcGFyc2VQb3NpdGlvbihwYXJzZWRFbmQgfHwgKHBhcnNlZEVuZFRyaWdnZXIgPyBcIjEwMCUgMFwiIDogbWF4KSwgcGFyc2VkRW5kVHJpZ2dlciwgc2l6ZSwgZGlyZWN0aW9uLCBzY3JvbGxGdW5jKCkgKyBvZmZzZXQsIG1hcmtlckVuZCwgbWFya2VyRW5kVHJpZ2dlciwgc2VsZiwgc2Nyb2xsZXJCb3VuZHMsIGJvcmRlcldpZHRoLCB1c2VGaXhlZFBvc2l0aW9uLCBtYXgsIGNvbnRhaW5lckFuaW1hdGlvbikpIHx8IC0wLjAwMTtcblx0ICAgICAgY2hhbmdlID0gZW5kIC0gc3RhcnQgfHwgKHN0YXJ0IC09IDAuMDEpICYmIDAuMDAxO1xuXHQgICAgICBvZmZzZXQgPSAwO1xuXHQgICAgICBpID0gdHJpZ2dlckluZGV4O1xuXG5cdCAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICBjdXJUcmlnZ2VyID0gX3RyaWdnZXJzW2ldO1xuXHQgICAgICAgIGN1clBpbiA9IGN1clRyaWdnZXIucGluO1xuXG5cdCAgICAgICAgaWYgKGN1clBpbiAmJiBjdXJUcmlnZ2VyLnN0YXJ0IC0gY3VyVHJpZ2dlci5fcGluUHVzaCA8IHN0YXJ0ICYmICFjb250YWluZXJBbmltYXRpb24pIHtcblx0ICAgICAgICAgIGNzID0gY3VyVHJpZ2dlci5lbmQgLSBjdXJUcmlnZ2VyLnN0YXJ0O1xuXG5cdCAgICAgICAgICBpZiAoKGN1clBpbiA9PT0gdHJpZ2dlciB8fCBjdXJQaW4gPT09IHBpbm5lZENvbnRhaW5lcikgJiYgIV9pc051bWJlcihwYXJzZWRTdGFydCkpIHtcblx0ICAgICAgICAgICAgb2Zmc2V0ICs9IGNzICogKDEgLSBjdXJUcmlnZ2VyLnByb2dyZXNzKTtcblx0ICAgICAgICAgIH1cblxuXHQgICAgICAgICAgY3VyUGluID09PSBwaW4gJiYgKG90aGVyUGluT2Zmc2V0ICs9IGNzKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICBzdGFydCArPSBvZmZzZXQ7XG5cdCAgICAgIGVuZCArPSBvZmZzZXQ7XG5cdCAgICAgIHNlbGYuX3BpblB1c2ggPSBvdGhlclBpbk9mZnNldDtcblxuXHQgICAgICBpZiAobWFya2VyU3RhcnQgJiYgb2Zmc2V0KSB7XG5cdCAgICAgICAgY3MgPSB7fTtcblx0ICAgICAgICBjc1tkaXJlY3Rpb24uYV0gPSBcIis9XCIgKyBvZmZzZXQ7XG5cdCAgICAgICAgcGlubmVkQ29udGFpbmVyICYmIChjc1tkaXJlY3Rpb24ucF0gPSBcIi09XCIgKyBzY3JvbGxGdW5jKCkpO1xuXHQgICAgICAgIGdzYXAuc2V0KFttYXJrZXJTdGFydCwgbWFya2VyRW5kXSwgY3MpO1xuXHQgICAgICB9XG5cblx0ICAgICAgaWYgKHBpbikge1xuXHQgICAgICAgIGNzID0gX2dldENvbXB1dGVkU3R5bGUocGluKTtcblx0ICAgICAgICBpc1ZlcnRpY2FsID0gZGlyZWN0aW9uID09PSBfdmVydGljYWw7XG5cdCAgICAgICAgc2Nyb2xsID0gc2Nyb2xsRnVuYygpO1xuXHQgICAgICAgIHBpblN0YXJ0ID0gcGFyc2VGbG9hdChwaW5HZXR0ZXIoZGlyZWN0aW9uLmEpKSArIG90aGVyUGluT2Zmc2V0O1xuXHQgICAgICAgICFtYXggJiYgZW5kID4gMSAmJiAoKGlzVmlld3BvcnQgPyBfYm9keSA6IHNjcm9sbGVyKS5zdHlsZVtcIm92ZXJmbG93LVwiICsgZGlyZWN0aW9uLmFdID0gXCJzY3JvbGxcIik7XG5cblx0ICAgICAgICBfc3dhcFBpbkluKHBpbiwgc3BhY2VyLCBjcyk7XG5cblx0ICAgICAgICBwaW5TdGF0ZSA9IF9nZXRTdGF0ZShwaW4pO1xuXHQgICAgICAgIGJvdW5kcyA9IF9nZXRCb3VuZHMocGluLCB0cnVlKTtcblx0ICAgICAgICBvcHBvc2l0ZVNjcm9sbCA9IHVzZUZpeGVkUG9zaXRpb24gJiYgX2dldFNjcm9sbEZ1bmMoc2Nyb2xsZXIsIGlzVmVydGljYWwgPyBfaG9yaXpvbnRhbCA6IF92ZXJ0aWNhbCkoKTtcblxuXHQgICAgICAgIGlmIChwaW5TcGFjaW5nKSB7XG5cdCAgICAgICAgICBzcGFjZXJTdGF0ZSA9IFtwaW5TcGFjaW5nICsgZGlyZWN0aW9uLm9zMiwgY2hhbmdlICsgb3RoZXJQaW5PZmZzZXQgKyBfcHhdO1xuXHQgICAgICAgICAgc3BhY2VyU3RhdGUudCA9IHNwYWNlcjtcblx0ICAgICAgICAgIGkgPSBwaW5TcGFjaW5nID09PSBfcGFkZGluZyA/IF9nZXRTaXplKHBpbiwgZGlyZWN0aW9uKSArIGNoYW5nZSArIG90aGVyUGluT2Zmc2V0IDogMDtcblx0ICAgICAgICAgIGkgJiYgc3BhY2VyU3RhdGUucHVzaChkaXJlY3Rpb24uZCwgaSArIF9weCk7XG5cblx0ICAgICAgICAgIF9zZXRTdGF0ZShzcGFjZXJTdGF0ZSk7XG5cblx0ICAgICAgICAgIHVzZUZpeGVkUG9zaXRpb24gJiYgc2Nyb2xsRnVuYyhwcmV2U2Nyb2xsKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBpZiAodXNlRml4ZWRQb3NpdGlvbikge1xuXHQgICAgICAgICAgb3ZlcnJpZGUgPSB7XG5cdCAgICAgICAgICAgIHRvcDogYm91bmRzLnRvcCArIChpc1ZlcnRpY2FsID8gc2Nyb2xsIC0gc3RhcnQgOiBvcHBvc2l0ZVNjcm9sbCkgKyBfcHgsXG5cdCAgICAgICAgICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgKGlzVmVydGljYWwgPyBvcHBvc2l0ZVNjcm9sbCA6IHNjcm9sbCAtIHN0YXJ0KSArIF9weCxcblx0ICAgICAgICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcblx0ICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIlxuXHQgICAgICAgICAgfTtcblx0ICAgICAgICAgIG92ZXJyaWRlW193aWR0aF0gPSBvdmVycmlkZVtcIm1heFwiICsgX1dpZHRoXSA9IE1hdGguY2VpbChib3VuZHMud2lkdGgpICsgX3B4O1xuXHQgICAgICAgICAgb3ZlcnJpZGVbX2hlaWdodF0gPSBvdmVycmlkZVtcIm1heFwiICsgX0hlaWdodF0gPSBNYXRoLmNlaWwoYm91bmRzLmhlaWdodCkgKyBfcHg7XG5cdCAgICAgICAgICBvdmVycmlkZVtfbWFyZ2luXSA9IG92ZXJyaWRlW19tYXJnaW4gKyBfVG9wXSA9IG92ZXJyaWRlW19tYXJnaW4gKyBfUmlnaHRdID0gb3ZlcnJpZGVbX21hcmdpbiArIF9Cb3R0b21dID0gb3ZlcnJpZGVbX21hcmdpbiArIF9MZWZ0XSA9IFwiMFwiO1xuXHQgICAgICAgICAgb3ZlcnJpZGVbX3BhZGRpbmddID0gY3NbX3BhZGRpbmddO1xuXHQgICAgICAgICAgb3ZlcnJpZGVbX3BhZGRpbmcgKyBfVG9wXSA9IGNzW19wYWRkaW5nICsgX1RvcF07XG5cdCAgICAgICAgICBvdmVycmlkZVtfcGFkZGluZyArIF9SaWdodF0gPSBjc1tfcGFkZGluZyArIF9SaWdodF07XG5cdCAgICAgICAgICBvdmVycmlkZVtfcGFkZGluZyArIF9Cb3R0b21dID0gY3NbX3BhZGRpbmcgKyBfQm90dG9tXTtcblx0ICAgICAgICAgIG92ZXJyaWRlW19wYWRkaW5nICsgX0xlZnRdID0gY3NbX3BhZGRpbmcgKyBfTGVmdF07XG5cdCAgICAgICAgICBwaW5BY3RpdmVTdGF0ZSA9IF9jb3B5U3RhdGUocGluT3JpZ2luYWxTdGF0ZSwgb3ZlcnJpZGUsIHBpblJlcGFyZW50KTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBpZiAoYW5pbWF0aW9uKSB7XG5cdCAgICAgICAgICBpbml0dGVkID0gYW5pbWF0aW9uLl9pbml0dGVkO1xuXG5cdCAgICAgICAgICBfc3VwcHJlc3NPdmVyd3JpdGVzKDEpO1xuXG5cdCAgICAgICAgICBhbmltYXRpb24ucmVuZGVyKGFuaW1hdGlvbi5kdXJhdGlvbigpLCB0cnVlLCB0cnVlKTtcblx0ICAgICAgICAgIHBpbkNoYW5nZSA9IHBpbkdldHRlcihkaXJlY3Rpb24uYSkgLSBwaW5TdGFydCArIGNoYW5nZSArIG90aGVyUGluT2Zmc2V0O1xuXHQgICAgICAgICAgY2hhbmdlICE9PSBwaW5DaGFuZ2UgJiYgcGluQWN0aXZlU3RhdGUuc3BsaWNlKHBpbkFjdGl2ZVN0YXRlLmxlbmd0aCAtIDIsIDIpO1xuXHQgICAgICAgICAgYW5pbWF0aW9uLnJlbmRlcigwLCB0cnVlLCB0cnVlKTtcblx0ICAgICAgICAgIGluaXR0ZWQgfHwgYW5pbWF0aW9uLmludmFsaWRhdGUoKTtcblxuXHQgICAgICAgICAgX3N1cHByZXNzT3ZlcndyaXRlcygwKTtcblx0ICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgcGluQ2hhbmdlID0gY2hhbmdlO1xuXHQgICAgICAgIH1cblx0ICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICYmIHNjcm9sbEZ1bmMoKSAmJiAhY29udGFpbmVyQW5pbWF0aW9uKSB7XG5cdCAgICAgICAgYm91bmRzID0gdHJpZ2dlci5wYXJlbnROb2RlO1xuXG5cdCAgICAgICAgd2hpbGUgKGJvdW5kcyAmJiBib3VuZHMgIT09IF9ib2R5KSB7XG5cdCAgICAgICAgICBpZiAoYm91bmRzLl9waW5PZmZzZXQpIHtcblx0ICAgICAgICAgICAgc3RhcnQgLT0gYm91bmRzLl9waW5PZmZzZXQ7XG5cdCAgICAgICAgICAgIGVuZCAtPSBib3VuZHMuX3Bpbk9mZnNldDtcblx0ICAgICAgICAgIH1cblxuXHQgICAgICAgICAgYm91bmRzID0gYm91bmRzLnBhcmVudE5vZGU7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgcmV2ZXJ0ZWRQaW5zICYmIHJldmVydGVkUGlucy5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgcmV0dXJuIHQucmV2ZXJ0KGZhbHNlKTtcblx0ICAgICAgfSk7XG5cdCAgICAgIHNlbGYuc3RhcnQgPSBzdGFydDtcblx0ICAgICAgc2VsZi5lbmQgPSBlbmQ7XG5cdCAgICAgIHNjcm9sbDEgPSBzY3JvbGwyID0gc2Nyb2xsRnVuYygpO1xuXG5cdCAgICAgIGlmICghY29udGFpbmVyQW5pbWF0aW9uKSB7XG5cdCAgICAgICAgc2Nyb2xsMSA8IHByZXZTY3JvbGwgJiYgc2Nyb2xsRnVuYyhwcmV2U2Nyb2xsKTtcblx0ICAgICAgICBzZWxmLnNjcm9sbC5yZWMgPSAwO1xuXHQgICAgICB9XG5cblx0ICAgICAgc2VsZi5yZXZlcnQoZmFsc2UpO1xuXHQgICAgICBfcmVmcmVzaGluZyA9IDA7XG5cdCAgICAgIGFuaW1hdGlvbiAmJiBpc1RvZ2dsZSAmJiBhbmltYXRpb24uX2luaXR0ZWQgJiYgYW5pbWF0aW9uLnByb2dyZXNzKCkgIT09IHByZXZBbmltUHJvZ3Jlc3MgJiYgYW5pbWF0aW9uLnByb2dyZXNzKHByZXZBbmltUHJvZ3Jlc3MsIHRydWUpLnJlbmRlcihhbmltYXRpb24udGltZSgpLCB0cnVlLCB0cnVlKTtcblxuXHQgICAgICBpZiAocHJldlByb2dyZXNzICE9PSBzZWxmLnByb2dyZXNzIHx8IGNvbnRhaW5lckFuaW1hdGlvbikge1xuXHQgICAgICAgIGFuaW1hdGlvbiAmJiAhaXNUb2dnbGUgJiYgYW5pbWF0aW9uLnRvdGFsUHJvZ3Jlc3MocHJldlByb2dyZXNzLCB0cnVlKTtcblx0ICAgICAgICBzZWxmLnByb2dyZXNzID0gcHJldlByb2dyZXNzO1xuXHQgICAgICAgIHNlbGYudXBkYXRlKDAsIDAsIDEpO1xuXHQgICAgICB9XG5cblx0ICAgICAgcGluICYmIHBpblNwYWNpbmcgJiYgKHNwYWNlci5fcGluT2Zmc2V0ID0gTWF0aC5yb3VuZChzZWxmLnByb2dyZXNzICogcGluQ2hhbmdlKSk7XG5cdCAgICAgIG9uUmVmcmVzaCAmJiBvblJlZnJlc2goc2VsZik7XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gKHNjcm9sbEZ1bmMoKSAtIHNjcm9sbDIpIC8gKF9nZXRUaW1lKCkgLSBfdGltZTIpICogMTAwMCB8fCAwO1xuXHQgICAgfTtcblxuXHQgICAgc2VsZi5lbmRBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIF9lbmRBbmltYXRpb24oc2VsZi5jYWxsYmFja0FuaW1hdGlvbik7XG5cblx0ICAgICAgaWYgKGFuaW1hdGlvbikge1xuXHQgICAgICAgIHNjcnViVHdlZW4gPyBzY3J1YlR3ZWVuLnByb2dyZXNzKDEpIDogIWFuaW1hdGlvbi5wYXVzZWQoKSA/IF9lbmRBbmltYXRpb24oYW5pbWF0aW9uLCBhbmltYXRpb24ucmV2ZXJzZWQoKSkgOiBpc1RvZ2dsZSB8fCBfZW5kQW5pbWF0aW9uKGFuaW1hdGlvbiwgc2VsZi5kaXJlY3Rpb24gPCAwLCAxKTtcblx0ICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgc2VsZi5sYWJlbFRvU2Nyb2xsID0gZnVuY3Rpb24gKGxhYmVsKSB7XG5cdCAgICAgIHJldHVybiBhbmltYXRpb24gJiYgYW5pbWF0aW9uLmxhYmVscyAmJiAoc3RhcnQgfHwgc2VsZi5yZWZyZXNoKCkgfHwgc3RhcnQpICsgYW5pbWF0aW9uLmxhYmVsc1tsYWJlbF0gLyBhbmltYXRpb24uZHVyYXRpb24oKSAqIGNoYW5nZSB8fCAwO1xuXHQgICAgfTtcblxuXHQgICAgc2VsZi5nZXRUcmFpbGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cdCAgICAgIHZhciBpID0gX3RyaWdnZXJzLmluZGV4T2Yoc2VsZiksXG5cdCAgICAgICAgICBhID0gc2VsZi5kaXJlY3Rpb24gPiAwID8gX3RyaWdnZXJzLnNsaWNlKDAsIGkpLnJldmVyc2UoKSA6IF90cmlnZ2Vycy5zbGljZShpICsgMSk7XG5cblx0ICAgICAgcmV0dXJuIF9pc1N0cmluZyhuYW1lKSA/IGEuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgcmV0dXJuIHQudmFycy5wcmV2ZW50T3ZlcmxhcHMgPT09IG5hbWU7XG5cdCAgICAgIH0pIDogYTtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYudXBkYXRlID0gZnVuY3Rpb24gKHJlc2V0LCByZWNvcmRWZWxvY2l0eSwgZm9yY2VGYWtlKSB7XG5cdCAgICAgIGlmIChjb250YWluZXJBbmltYXRpb24gJiYgIWZvcmNlRmFrZSAmJiAhcmVzZXQpIHtcblx0ICAgICAgICByZXR1cm47XG5cdCAgICAgIH1cblxuXHQgICAgICB2YXIgc2Nyb2xsID0gc2VsZi5zY3JvbGwoKSxcblx0ICAgICAgICAgIHAgPSByZXNldCA/IDAgOiAoc2Nyb2xsIC0gc3RhcnQpIC8gY2hhbmdlLFxuXHQgICAgICAgICAgY2xpcHBlZCA9IHAgPCAwID8gMCA6IHAgPiAxID8gMSA6IHAgfHwgMCxcblx0ICAgICAgICAgIHByZXZQcm9ncmVzcyA9IHNlbGYucHJvZ3Jlc3MsXG5cdCAgICAgICAgICBpc0FjdGl2ZSxcblx0ICAgICAgICAgIHdhc0FjdGl2ZSxcblx0ICAgICAgICAgIHRvZ2dsZVN0YXRlLFxuXHQgICAgICAgICAgYWN0aW9uLFxuXHQgICAgICAgICAgc3RhdGVDaGFuZ2VkLFxuXHQgICAgICAgICAgdG9nZ2xlZCxcblx0ICAgICAgICAgIGlzQXRNYXgsXG5cdCAgICAgICAgICBpc1Rha2luZ0FjdGlvbjtcblxuXHQgICAgICBpZiAocmVjb3JkVmVsb2NpdHkpIHtcblx0ICAgICAgICBzY3JvbGwyID0gc2Nyb2xsMTtcblx0ICAgICAgICBzY3JvbGwxID0gY29udGFpbmVyQW5pbWF0aW9uID8gc2Nyb2xsRnVuYygpIDogc2Nyb2xsO1xuXG5cdCAgICAgICAgaWYgKHNuYXApIHtcblx0ICAgICAgICAgIHNuYXAyID0gc25hcDE7XG5cdCAgICAgICAgICBzbmFwMSA9IGFuaW1hdGlvbiAmJiAhaXNUb2dnbGUgPyBhbmltYXRpb24udG90YWxQcm9ncmVzcygpIDogY2xpcHBlZDtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblxuXHQgICAgICBhbnRpY2lwYXRlUGluICYmICFjbGlwcGVkICYmIHBpbiAmJiAhX3JlZnJlc2hpbmcgJiYgIV9zdGFydHVwICYmIF9sYXN0U2Nyb2xsVGltZSAmJiBzdGFydCA8IHNjcm9sbCArIChzY3JvbGwgLSBzY3JvbGwyKSAvIChfZ2V0VGltZSgpIC0gX3RpbWUyKSAqIGFudGljaXBhdGVQaW4gJiYgKGNsaXBwZWQgPSAwLjAwMDEpO1xuXG5cdCAgICAgIGlmIChjbGlwcGVkICE9PSBwcmV2UHJvZ3Jlc3MgJiYgc2VsZi5lbmFibGVkKSB7XG5cdCAgICAgICAgaXNBY3RpdmUgPSBzZWxmLmlzQWN0aXZlID0gISFjbGlwcGVkICYmIGNsaXBwZWQgPCAxO1xuXHQgICAgICAgIHdhc0FjdGl2ZSA9ICEhcHJldlByb2dyZXNzICYmIHByZXZQcm9ncmVzcyA8IDE7XG5cdCAgICAgICAgdG9nZ2xlZCA9IGlzQWN0aXZlICE9PSB3YXNBY3RpdmU7XG5cdCAgICAgICAgc3RhdGVDaGFuZ2VkID0gdG9nZ2xlZCB8fCAhIWNsaXBwZWQgIT09ICEhcHJldlByb2dyZXNzO1xuXHQgICAgICAgIHNlbGYuZGlyZWN0aW9uID0gY2xpcHBlZCA+IHByZXZQcm9ncmVzcyA/IDEgOiAtMTtcblx0ICAgICAgICBzZWxmLnByb2dyZXNzID0gY2xpcHBlZDtcblxuXHQgICAgICAgIGlmIChzdGF0ZUNoYW5nZWQgJiYgIV9yZWZyZXNoaW5nKSB7XG5cdCAgICAgICAgICB0b2dnbGVTdGF0ZSA9IGNsaXBwZWQgJiYgIXByZXZQcm9ncmVzcyA/IDAgOiBjbGlwcGVkID09PSAxID8gMSA6IHByZXZQcm9ncmVzcyA9PT0gMSA/IDIgOiAzO1xuXG5cdCAgICAgICAgICBpZiAoaXNUb2dnbGUpIHtcblx0ICAgICAgICAgICAgYWN0aW9uID0gIXRvZ2dsZWQgJiYgdG9nZ2xlQWN0aW9uc1t0b2dnbGVTdGF0ZSArIDFdICE9PSBcIm5vbmVcIiAmJiB0b2dnbGVBY3Rpb25zW3RvZ2dsZVN0YXRlICsgMV0gfHwgdG9nZ2xlQWN0aW9uc1t0b2dnbGVTdGF0ZV07XG5cdCAgICAgICAgICAgIGlzVGFraW5nQWN0aW9uID0gYW5pbWF0aW9uICYmIChhY3Rpb24gPT09IFwiY29tcGxldGVcIiB8fCBhY3Rpb24gPT09IFwicmVzZXRcIiB8fCBhY3Rpb24gaW4gYW5pbWF0aW9uKTtcblx0ICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICBwcmV2ZW50T3ZlcmxhcHMgJiYgdG9nZ2xlZCAmJiAoaXNUYWtpbmdBY3Rpb24gfHwgc2NydWIgfHwgIWFuaW1hdGlvbikgJiYgKF9pc0Z1bmN0aW9uKHByZXZlbnRPdmVybGFwcykgPyBwcmV2ZW50T3ZlcmxhcHMoc2VsZikgOiBzZWxmLmdldFRyYWlsaW5nKHByZXZlbnRPdmVybGFwcykuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuXHQgICAgICAgICAgcmV0dXJuIHQuZW5kQW5pbWF0aW9uKCk7XG5cdCAgICAgICAgfSkpO1xuXG5cdCAgICAgICAgaWYgKCFpc1RvZ2dsZSkge1xuXHQgICAgICAgICAgaWYgKHNjcnViVHdlZW4gJiYgIV9yZWZyZXNoaW5nICYmICFfc3RhcnR1cCkge1xuXHQgICAgICAgICAgICBzY3J1YlR3ZWVuLnZhcnMudG90YWxQcm9ncmVzcyA9IGNsaXBwZWQ7XG5cdCAgICAgICAgICAgIHNjcnViVHdlZW4uaW52YWxpZGF0ZSgpLnJlc3RhcnQoKTtcblx0ICAgICAgICAgIH0gZWxzZSBpZiAoYW5pbWF0aW9uKSB7XG5cdCAgICAgICAgICAgIGFuaW1hdGlvbi50b3RhbFByb2dyZXNzKGNsaXBwZWQsICEhX3JlZnJlc2hpbmcpO1xuXHQgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmIChwaW4pIHtcblx0ICAgICAgICAgIHJlc2V0ICYmIHBpblNwYWNpbmcgJiYgKHNwYWNlci5zdHlsZVtwaW5TcGFjaW5nICsgZGlyZWN0aW9uLm9zMl0gPSBzcGFjaW5nU3RhcnQpO1xuXG5cdCAgICAgICAgICBpZiAoIXVzZUZpeGVkUG9zaXRpb24pIHtcblx0ICAgICAgICAgICAgcGluU2V0dGVyKHBpblN0YXJ0ICsgcGluQ2hhbmdlICogY2xpcHBlZCk7XG5cdCAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRlQ2hhbmdlZCkge1xuXHQgICAgICAgICAgICBpc0F0TWF4ID0gIXJlc2V0ICYmIGNsaXBwZWQgPiBwcmV2UHJvZ3Jlc3MgJiYgZW5kICsgMSA+IHNjcm9sbCAmJiBzY3JvbGwgKyAxID49IF9tYXhTY3JvbGwoc2Nyb2xsZXIsIGRpcmVjdGlvbik7XG5cblx0ICAgICAgICAgICAgaWYgKHBpblJlcGFyZW50KSB7XG5cdCAgICAgICAgICAgICAgaWYgKCFyZXNldCAmJiAoaXNBY3RpdmUgfHwgaXNBdE1heCkpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBfZ2V0Qm91bmRzKHBpbiwgdHJ1ZSksXG5cdCAgICAgICAgICAgICAgICAgICAgX29mZnNldCA9IHNjcm9sbCAtIHN0YXJ0O1xuXG5cdCAgICAgICAgICAgICAgICBfcmVwYXJlbnQocGluLCBfYm9keSwgYm91bmRzLnRvcCArIChkaXJlY3Rpb24gPT09IF92ZXJ0aWNhbCA/IF9vZmZzZXQgOiAwKSArIF9weCwgYm91bmRzLmxlZnQgKyAoZGlyZWN0aW9uID09PSBfdmVydGljYWwgPyAwIDogX29mZnNldCkgKyBfcHgpO1xuXHQgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICBfcmVwYXJlbnQocGluLCBzcGFjZXIpO1xuXHQgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIF9zZXRTdGF0ZShpc0FjdGl2ZSB8fCBpc0F0TWF4ID8gcGluQWN0aXZlU3RhdGUgOiBwaW5TdGF0ZSk7XG5cblx0ICAgICAgICAgICAgcGluQ2hhbmdlICE9PSBjaGFuZ2UgJiYgY2xpcHBlZCA8IDEgJiYgaXNBY3RpdmUgfHwgcGluU2V0dGVyKHBpblN0YXJ0ICsgKGNsaXBwZWQgPT09IDEgJiYgIWlzQXRNYXggPyBwaW5DaGFuZ2UgOiAwKSk7XG5cdCAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgc25hcCAmJiAhdHdlZW5Uby50d2VlbiAmJiAhX3JlZnJlc2hpbmcgJiYgIV9zdGFydHVwICYmIHNuYXBEZWxheWVkQ2FsbC5yZXN0YXJ0KHRydWUpO1xuXHQgICAgICAgIHRvZ2dsZUNsYXNzICYmICh0b2dnbGVkIHx8IG9uY2UgJiYgY2xpcHBlZCAmJiAoY2xpcHBlZCA8IDEgfHwgIV9saW1pdENhbGxiYWNrcykpICYmIF90b0FycmF5KHRvZ2dsZUNsYXNzLnRhcmdldHMpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG5cdCAgICAgICAgICByZXR1cm4gZWwuY2xhc3NMaXN0W2lzQWN0aXZlIHx8IG9uY2UgPyBcImFkZFwiIDogXCJyZW1vdmVcIl0odG9nZ2xlQ2xhc3MuY2xhc3NOYW1lKTtcblx0ICAgICAgICB9KTtcblx0ICAgICAgICBvblVwZGF0ZSAmJiAhaXNUb2dnbGUgJiYgIXJlc2V0ICYmIG9uVXBkYXRlKHNlbGYpO1xuXG5cdCAgICAgICAgaWYgKHN0YXRlQ2hhbmdlZCAmJiAhX3JlZnJlc2hpbmcpIHtcblx0ICAgICAgICAgIGlmIChpc1RvZ2dsZSkge1xuXHQgICAgICAgICAgICBpZiAoaXNUYWtpbmdBY3Rpb24pIHtcblx0ICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSBcImNvbXBsZXRlXCIpIHtcblx0ICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5wYXVzZSgpLnRvdGFsUHJvZ3Jlc3MoMSk7XG5cdCAgICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFwicmVzZXRcIikge1xuXHQgICAgICAgICAgICAgICAgYW5pbWF0aW9uLnJlc3RhcnQodHJ1ZSkucGF1c2UoKTtcblx0ICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gXCJyZXN0YXJ0XCIpIHtcblx0ICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5yZXN0YXJ0KHRydWUpO1xuXHQgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICBhbmltYXRpb25bYWN0aW9uXSgpO1xuXHQgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIG9uVXBkYXRlICYmIG9uVXBkYXRlKHNlbGYpO1xuXHQgICAgICAgICAgfVxuXG5cdCAgICAgICAgICBpZiAodG9nZ2xlZCB8fCAhX2xpbWl0Q2FsbGJhY2tzKSB7XG5cdCAgICAgICAgICAgIG9uVG9nZ2xlICYmIHRvZ2dsZWQgJiYgX2NhbGxiYWNrKHNlbGYsIG9uVG9nZ2xlKTtcblx0ICAgICAgICAgICAgY2FsbGJhY2tzW3RvZ2dsZVN0YXRlXSAmJiBfY2FsbGJhY2soc2VsZiwgY2FsbGJhY2tzW3RvZ2dsZVN0YXRlXSk7XG5cdCAgICAgICAgICAgIG9uY2UgJiYgKGNsaXBwZWQgPT09IDEgPyBzZWxmLmtpbGwoZmFsc2UsIDEpIDogY2FsbGJhY2tzW3RvZ2dsZVN0YXRlXSA9IDApO1xuXG5cdCAgICAgICAgICAgIGlmICghdG9nZ2xlZCkge1xuXHQgICAgICAgICAgICAgIHRvZ2dsZVN0YXRlID0gY2xpcHBlZCA9PT0gMSA/IDEgOiAzO1xuXHQgICAgICAgICAgICAgIGNhbGxiYWNrc1t0b2dnbGVTdGF0ZV0gJiYgX2NhbGxiYWNrKHNlbGYsIGNhbGxiYWNrc1t0b2dnbGVTdGF0ZV0pO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICB9XG5cblx0ICAgICAgICAgIGlmIChmYXN0U2Nyb2xsRW5kICYmICFpc0FjdGl2ZSAmJiBNYXRoLmFicyhzZWxmLmdldFZlbG9jaXR5KCkpID4gKF9pc051bWJlcihmYXN0U2Nyb2xsRW5kKSA/IGZhc3RTY3JvbGxFbmQgOiAyNTAwKSkge1xuXHQgICAgICAgICAgICBfZW5kQW5pbWF0aW9uKHNlbGYuY2FsbGJhY2tBbmltYXRpb24pO1xuXG5cdCAgICAgICAgICAgIHNjcnViVHdlZW4gPyBzY3J1YlR3ZWVuLnByb2dyZXNzKDEpIDogX2VuZEFuaW1hdGlvbihhbmltYXRpb24sICFjbGlwcGVkLCAxKTtcblx0ICAgICAgICAgIH1cblx0ICAgICAgICB9IGVsc2UgaWYgKGlzVG9nZ2xlICYmIG9uVXBkYXRlICYmICFfcmVmcmVzaGluZykge1xuXHQgICAgICAgICAgb25VcGRhdGUoc2VsZik7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cblx0ICAgICAgaWYgKG1hcmtlckVuZFNldHRlcikge1xuXHQgICAgICAgIHZhciBuID0gY29udGFpbmVyQW5pbWF0aW9uID8gc2Nyb2xsIC8gY29udGFpbmVyQW5pbWF0aW9uLmR1cmF0aW9uKCkgKiAoY29udGFpbmVyQW5pbWF0aW9uLl9jYVNjcm9sbERpc3QgfHwgMCkgOiBzY3JvbGw7XG5cdCAgICAgICAgbWFya2VyU3RhcnRTZXR0ZXIobiArIChtYXJrZXJTdGFydFRyaWdnZXIuX2lzRmxpcHBlZCA/IDEgOiAwKSk7XG5cdCAgICAgICAgbWFya2VyRW5kU2V0dGVyKG4pO1xuXHQgICAgICB9XG5cblx0ICAgICAgY2FNYXJrZXJTZXR0ZXIgJiYgY2FNYXJrZXJTZXR0ZXIoLXNjcm9sbCAvIGNvbnRhaW5lckFuaW1hdGlvbi5kdXJhdGlvbigpICogKGNvbnRhaW5lckFuaW1hdGlvbi5fY2FTY3JvbGxEaXN0IHx8IDApKTtcblx0ICAgIH07XG5cblx0ICAgIHNlbGYuZW5hYmxlID0gZnVuY3Rpb24gKHJlc2V0LCByZWZyZXNoKSB7XG5cdCAgICAgIGlmICghc2VsZi5lbmFibGVkKSB7XG5cdCAgICAgICAgc2VsZi5lbmFibGVkID0gdHJ1ZTtcblxuXHQgICAgICAgIF9hZGRMaXN0ZW5lcihzY3JvbGxlciwgXCJyZXNpemVcIiwgX29uUmVzaXplKTtcblxuXHQgICAgICAgIF9hZGRMaXN0ZW5lcihzY3JvbGxlciwgXCJzY3JvbGxcIiwgX29uU2Nyb2xsKTtcblxuXHQgICAgICAgIG9uUmVmcmVzaEluaXQgJiYgX2FkZExpc3RlbmVyKFNjcm9sbFRyaWdnZXIsIFwicmVmcmVzaEluaXRcIiwgb25SZWZyZXNoSW5pdCk7XG5cblx0ICAgICAgICBpZiAocmVzZXQgIT09IGZhbHNlKSB7XG5cdCAgICAgICAgICBzZWxmLnByb2dyZXNzID0gcHJldlByb2dyZXNzID0gMDtcblx0ICAgICAgICAgIHNjcm9sbDEgPSBzY3JvbGwyID0gbGFzdFNuYXAgPSBzY3JvbGxGdW5jKCk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgcmVmcmVzaCAhPT0gZmFsc2UgJiYgc2VsZi5yZWZyZXNoKCk7XG5cdCAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIHNlbGYuZ2V0VHdlZW4gPSBmdW5jdGlvbiAoc25hcCkge1xuXHQgICAgICByZXR1cm4gc25hcCAmJiB0d2VlblRvID8gdHdlZW5Uby50d2VlbiA6IHNjcnViVHdlZW47XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLnNldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIChuZXdTdGFydCwgbmV3RW5kKSB7XG5cdCAgICAgIGlmIChwaW4pIHtcblx0ICAgICAgICBwaW5TdGFydCArPSBuZXdTdGFydCAtIHN0YXJ0O1xuXHQgICAgICAgIHBpbkNoYW5nZSArPSBuZXdFbmQgLSBuZXdTdGFydCAtIGNoYW5nZTtcblx0ICAgICAgfVxuXG5cdCAgICAgIHNlbGYuc3RhcnQgPSBzdGFydCA9IG5ld1N0YXJ0O1xuXHQgICAgICBzZWxmLmVuZCA9IGVuZCA9IG5ld0VuZDtcblx0ICAgICAgY2hhbmdlID0gbmV3RW5kIC0gbmV3U3RhcnQ7XG5cdCAgICAgIHNlbGYudXBkYXRlKCk7XG5cdCAgICB9O1xuXG5cdCAgICBzZWxmLmRpc2FibGUgPSBmdW5jdGlvbiAocmVzZXQsIGFsbG93QW5pbWF0aW9uKSB7XG5cdCAgICAgIGlmIChzZWxmLmVuYWJsZWQpIHtcblx0ICAgICAgICByZXNldCAhPT0gZmFsc2UgJiYgc2VsZi5yZXZlcnQoKTtcblx0ICAgICAgICBzZWxmLmVuYWJsZWQgPSBzZWxmLmlzQWN0aXZlID0gZmFsc2U7XG5cdCAgICAgICAgYWxsb3dBbmltYXRpb24gfHwgc2NydWJUd2VlbiAmJiBzY3J1YlR3ZWVuLnBhdXNlKCk7XG5cdCAgICAgICAgcHJldlNjcm9sbCA9IDA7XG5cdCAgICAgICAgcGluQ2FjaGUgJiYgKHBpbkNhY2hlLnVuY2FjaGUgPSAxKTtcblx0ICAgICAgICBvblJlZnJlc2hJbml0ICYmIF9yZW1vdmVMaXN0ZW5lcihTY3JvbGxUcmlnZ2VyLCBcInJlZnJlc2hJbml0XCIsIG9uUmVmcmVzaEluaXQpO1xuXG5cdCAgICAgICAgaWYgKHNuYXBEZWxheWVkQ2FsbCkge1xuXHQgICAgICAgICAgc25hcERlbGF5ZWRDYWxsLnBhdXNlKCk7XG5cdCAgICAgICAgICB0d2VlblRvLnR3ZWVuICYmIHR3ZWVuVG8udHdlZW4ua2lsbCgpICYmICh0d2VlblRvLnR3ZWVuID0gMCk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKCFpc1ZpZXdwb3J0KSB7XG5cdCAgICAgICAgICB2YXIgaSA9IF90cmlnZ2Vycy5sZW5ndGg7XG5cblx0ICAgICAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICAgICAgaWYgKF90cmlnZ2Vyc1tpXS5zY3JvbGxlciA9PT0gc2Nyb2xsZXIgJiYgX3RyaWdnZXJzW2ldICE9PSBzZWxmKSB7XG5cdCAgICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICB9XG5cblx0ICAgICAgICAgIF9yZW1vdmVMaXN0ZW5lcihzY3JvbGxlciwgXCJyZXNpemVcIiwgX29uUmVzaXplKTtcblxuXHQgICAgICAgICAgX3JlbW92ZUxpc3RlbmVyKHNjcm9sbGVyLCBcInNjcm9sbFwiLCBfb25TY3JvbGwpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgc2VsZi5raWxsID0gZnVuY3Rpb24gKHJldmVydCwgYWxsb3dBbmltYXRpb24pIHtcblx0ICAgICAgc2VsZi5kaXNhYmxlKHJldmVydCwgYWxsb3dBbmltYXRpb24pO1xuXHQgICAgICBzY3J1YlR3ZWVuICYmIHNjcnViVHdlZW4ua2lsbCgpO1xuXHQgICAgICBpZCAmJiBkZWxldGUgX2lkc1tpZF07XG5cblx0ICAgICAgdmFyIGkgPSBfdHJpZ2dlcnMuaW5kZXhPZihzZWxmKTtcblxuXHQgICAgICBpID49IDAgJiYgX3RyaWdnZXJzLnNwbGljZShpLCAxKTtcblx0ICAgICAgaSA9PT0gX2kgJiYgX2RpcmVjdGlvbiA+IDAgJiYgX2ktLTtcblx0ICAgICAgaSA9IDA7XG5cblx0ICAgICAgX3RyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICByZXR1cm4gdC5zY3JvbGxlciA9PT0gc2VsZi5zY3JvbGxlciAmJiAoaSA9IDEpO1xuXHQgICAgICB9KTtcblxuXHQgICAgICBpIHx8IChzZWxmLnNjcm9sbC5yZWMgPSAwKTtcblxuXHQgICAgICBpZiAoYW5pbWF0aW9uKSB7XG5cdCAgICAgICAgYW5pbWF0aW9uLnNjcm9sbFRyaWdnZXIgPSBudWxsO1xuXHQgICAgICAgIHJldmVydCAmJiBhbmltYXRpb24ucmVuZGVyKC0xKTtcblx0ICAgICAgICBhbGxvd0FuaW1hdGlvbiB8fCBhbmltYXRpb24ua2lsbCgpO1xuXHQgICAgICB9XG5cblx0ICAgICAgbWFya2VyU3RhcnQgJiYgW21hcmtlclN0YXJ0LCBtYXJrZXJFbmQsIG1hcmtlclN0YXJ0VHJpZ2dlciwgbWFya2VyRW5kVHJpZ2dlcl0uZm9yRWFjaChmdW5jdGlvbiAobSkge1xuXHQgICAgICAgIHJldHVybiBtLnBhcmVudE5vZGUgJiYgbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG0pO1xuXHQgICAgICB9KTtcblxuXHQgICAgICBpZiAocGluKSB7XG5cdCAgICAgICAgcGluQ2FjaGUgJiYgKHBpbkNhY2hlLnVuY2FjaGUgPSAxKTtcblx0ICAgICAgICBpID0gMDtcblxuXHQgICAgICAgIF90cmlnZ2Vycy5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgICByZXR1cm4gdC5waW4gPT09IHBpbiAmJiBpKys7XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBpIHx8IChwaW5DYWNoZS5zcGFjZXIgPSAwKTtcblx0ICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgc2VsZi5lbmFibGUoZmFsc2UsIGZhbHNlKTtcblx0ICAgICFhbmltYXRpb24gfHwgIWFuaW1hdGlvbi5hZGQgfHwgY2hhbmdlID8gc2VsZi5yZWZyZXNoKCkgOiBnc2FwLmRlbGF5ZWRDYWxsKDAuMDEsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgcmV0dXJuIHN0YXJ0IHx8IGVuZCB8fCBzZWxmLnJlZnJlc2goKTtcblx0ICAgIH0pICYmIChjaGFuZ2UgPSAwLjAxKSAmJiAoc3RhcnQgPSBlbmQgPSAwKTtcblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5yZWdpc3RlciA9IGZ1bmN0aW9uIHJlZ2lzdGVyKGNvcmUpIHtcblx0ICAgIGlmICghX2NvcmVJbml0dGVkKSB7XG5cdCAgICAgIGdzYXAgPSBjb3JlIHx8IF9nZXRHU0FQKCk7XG5cblx0ICAgICAgaWYgKF93aW5kb3dFeGlzdHMoKSAmJiB3aW5kb3cuZG9jdW1lbnQpIHtcblx0ICAgICAgICBfd2luID0gd2luZG93O1xuXHQgICAgICAgIF9kb2MgPSBkb2N1bWVudDtcblx0ICAgICAgICBfZG9jRWwgPSBfZG9jLmRvY3VtZW50RWxlbWVudDtcblx0ICAgICAgICBfYm9keSA9IF9kb2MuYm9keTtcblx0ICAgICAgfVxuXG5cdCAgICAgIGlmIChnc2FwKSB7XG5cdCAgICAgICAgX3RvQXJyYXkgPSBnc2FwLnV0aWxzLnRvQXJyYXk7XG5cdCAgICAgICAgX2NsYW1wID0gZ3NhcC51dGlscy5jbGFtcDtcblx0ICAgICAgICBfc3VwcHJlc3NPdmVyd3JpdGVzID0gZ3NhcC5jb3JlLnN1cHByZXNzT3ZlcndyaXRlcyB8fCBfcGFzc1Rocm91Z2g7XG5cdCAgICAgICAgZ3NhcC5jb3JlLmdsb2JhbHMoXCJTY3JvbGxUcmlnZ2VyXCIsIFNjcm9sbFRyaWdnZXIpO1xuXG5cdCAgICAgICAgaWYgKF9ib2R5KSB7XG5cdCAgICAgICAgICBfYWRkTGlzdGVuZXIoX3dpbiwgXCJ3aGVlbFwiLCBfb25TY3JvbGwpO1xuXG5cdCAgICAgICAgICBfcm9vdCA9IFtfd2luLCBfZG9jLCBfZG9jRWwsIF9ib2R5XTtcblxuXHQgICAgICAgICAgX2FkZExpc3RlbmVyKF9kb2MsIFwic2Nyb2xsXCIsIF9vblNjcm9sbCk7XG5cblx0ICAgICAgICAgIHZhciBib2R5U3R5bGUgPSBfYm9keS5zdHlsZSxcblx0ICAgICAgICAgICAgICBib3JkZXIgPSBib2R5U3R5bGUuYm9yZGVyVG9wU3R5bGUsXG5cdCAgICAgICAgICAgICAgYm91bmRzO1xuXHQgICAgICAgICAgYm9keVN0eWxlLmJvcmRlclRvcFN0eWxlID0gXCJzb2xpZFwiO1xuXHQgICAgICAgICAgYm91bmRzID0gX2dldEJvdW5kcyhfYm9keSk7XG5cdCAgICAgICAgICBfdmVydGljYWwubSA9IE1hdGgucm91bmQoYm91bmRzLnRvcCArIF92ZXJ0aWNhbC5zYygpKSB8fCAwO1xuXHQgICAgICAgICAgX2hvcml6b250YWwubSA9IE1hdGgucm91bmQoYm91bmRzLmxlZnQgKyBfaG9yaXpvbnRhbC5zYygpKSB8fCAwO1xuXHQgICAgICAgICAgYm9yZGVyID8gYm9keVN0eWxlLmJvcmRlclRvcFN0eWxlID0gYm9yZGVyIDogYm9keVN0eWxlLnJlbW92ZVByb3BlcnR5KFwiYm9yZGVyLXRvcC1zdHlsZVwiKTtcblx0ICAgICAgICAgIF9zeW5jSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChfc3luYywgMjAwKTtcblx0ICAgICAgICAgIGdzYXAuZGVsYXllZENhbGwoMC41LCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBfc3RhcnR1cCA9IDA7XG5cdCAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgX2FkZExpc3RlbmVyKF9kb2MsIFwidG91Y2hjYW5jZWxcIiwgX3Bhc3NUaHJvdWdoKTtcblxuXHQgICAgICAgICAgX2FkZExpc3RlbmVyKF9ib2R5LCBcInRvdWNoc3RhcnRcIiwgX3Bhc3NUaHJvdWdoKTtcblxuXHQgICAgICAgICAgX211bHRpTGlzdGVuZXIoX2FkZExpc3RlbmVyLCBfZG9jLCBcInBvaW50ZXJkb3duLHRvdWNoc3RhcnQsbW91c2Vkb3duXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIF9wb2ludGVySXNEb3duID0gMTtcblx0ICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICBfbXVsdGlMaXN0ZW5lcihfYWRkTGlzdGVuZXIsIF9kb2MsIFwicG9pbnRlcnVwLHRvdWNoZW5kLG1vdXNldXBcIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICByZXR1cm4gX3BvaW50ZXJJc0Rvd24gPSAwO1xuXHQgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgIF90cmFuc2Zvcm1Qcm9wID0gZ3NhcC51dGlscy5jaGVja1ByZWZpeChcInRyYW5zZm9ybVwiKTtcblxuXHQgICAgICAgICAgX3N0YXRlUHJvcHMucHVzaChfdHJhbnNmb3JtUHJvcCk7XG5cblx0ICAgICAgICAgIF9jb3JlSW5pdHRlZCA9IF9nZXRUaW1lKCk7XG5cdCAgICAgICAgICBfcmVzaXplRGVsYXkgPSBnc2FwLmRlbGF5ZWRDYWxsKDAuMiwgX3JlZnJlc2hBbGwpLnBhdXNlKCk7XG5cdCAgICAgICAgICBfYXV0b1JlZnJlc2ggPSBbX2RvYywgXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIHcgPSBfd2luLmlubmVyV2lkdGgsXG5cdCAgICAgICAgICAgICAgICBoID0gX3dpbi5pbm5lckhlaWdodDtcblxuXHQgICAgICAgICAgICBpZiAoX2RvYy5oaWRkZW4pIHtcblx0ICAgICAgICAgICAgICBfcHJldldpZHRoID0gdztcblx0ICAgICAgICAgICAgICBfcHJldkhlaWdodCA9IGg7XG5cdCAgICAgICAgICAgIH0gZWxzZSBpZiAoX3ByZXZXaWR0aCAhPT0gdyB8fCBfcHJldkhlaWdodCAhPT0gaCkge1xuXHQgICAgICAgICAgICAgIF9vblJlc2l6ZSgpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICB9LCBfZG9jLCBcIkRPTUNvbnRlbnRMb2FkZWRcIiwgX3JlZnJlc2hBbGwsIF93aW4sIFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBfbGFzdFNjcm9sbFRpbWUgfHwgX3JlZnJlc2hBbGwoKTtcblx0ICAgICAgICAgIH0sIF93aW4sIFwicmVzaXplXCIsIF9vblJlc2l6ZV07XG5cblx0ICAgICAgICAgIF9pdGVyYXRlQXV0b1JlZnJlc2goX2FkZExpc3RlbmVyKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIF9jb3JlSW5pdHRlZDtcblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5kZWZhdWx0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzKGNvbmZpZykge1xuXHQgICAgaWYgKGNvbmZpZykge1xuXHQgICAgICBmb3IgKHZhciBwIGluIGNvbmZpZykge1xuXHQgICAgICAgIF9kZWZhdWx0c1twXSA9IGNvbmZpZ1twXTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gX2RlZmF1bHRzO1xuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLmtpbGwgPSBmdW5jdGlvbiBraWxsKCkge1xuXHQgICAgX2VuYWJsZWQgPSAwO1xuXG5cdCAgICBfdHJpZ2dlcnMuc2xpY2UoMCkuZm9yRWFjaChmdW5jdGlvbiAodHJpZ2dlcikge1xuXHQgICAgICByZXR1cm4gdHJpZ2dlci5raWxsKDEpO1xuXHQgICAgfSk7XG5cdCAgfTtcblxuXHQgIFNjcm9sbFRyaWdnZXIuY29uZmlnID0gZnVuY3Rpb24gY29uZmlnKHZhcnMpIHtcblx0ICAgIFwibGltaXRDYWxsYmFja3NcIiBpbiB2YXJzICYmIChfbGltaXRDYWxsYmFja3MgPSAhIXZhcnMubGltaXRDYWxsYmFja3MpO1xuXHQgICAgdmFyIG1zID0gdmFycy5zeW5jSW50ZXJ2YWw7XG5cdCAgICBtcyAmJiBjbGVhckludGVydmFsKF9zeW5jSW50ZXJ2YWwpIHx8IChfc3luY0ludGVydmFsID0gbXMpICYmIHNldEludGVydmFsKF9zeW5jLCBtcyk7XG5cblx0ICAgIGlmIChcImF1dG9SZWZyZXNoRXZlbnRzXCIgaW4gdmFycykge1xuXHQgICAgICBfaXRlcmF0ZUF1dG9SZWZyZXNoKF9yZW1vdmVMaXN0ZW5lcikgfHwgX2l0ZXJhdGVBdXRvUmVmcmVzaChfYWRkTGlzdGVuZXIsIHZhcnMuYXV0b1JlZnJlc2hFdmVudHMgfHwgXCJub25lXCIpO1xuXHQgICAgICBfaWdub3JlUmVzaXplID0gKHZhcnMuYXV0b1JlZnJlc2hFdmVudHMgKyBcIlwiKS5pbmRleE9mKFwicmVzaXplXCIpID09PSAtMTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5zY3JvbGxlclByb3h5ID0gZnVuY3Rpb24gc2Nyb2xsZXJQcm94eSh0YXJnZXQsIHZhcnMpIHtcblx0ICAgIHZhciB0ID0gX2dldFRhcmdldCh0YXJnZXQpLFxuXHQgICAgICAgIGkgPSBfc2Nyb2xsZXJzLmluZGV4T2YodCksXG5cdCAgICAgICAgaXNWaWV3cG9ydCA9IF9pc1ZpZXdwb3J0KHQpO1xuXG5cdCAgICBpZiAofmkpIHtcblx0ICAgICAgX3Njcm9sbGVycy5zcGxpY2UoaSwgaXNWaWV3cG9ydCA/IDYgOiAyKTtcblx0ICAgIH1cblxuXHQgICAgaWYgKHZhcnMpIHtcblx0ICAgICAgaXNWaWV3cG9ydCA/IF9wcm94aWVzLnVuc2hpZnQoX3dpbiwgdmFycywgX2JvZHksIHZhcnMsIF9kb2NFbCwgdmFycykgOiBfcHJveGllcy51bnNoaWZ0KHQsIHZhcnMpO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLm1hdGNoTWVkaWEgPSBmdW5jdGlvbiBtYXRjaE1lZGlhKHZhcnMpIHtcblx0ICAgIHZhciBtcSwgcCwgaSwgZnVuYywgcmVzdWx0O1xuXG5cdCAgICBmb3IgKHAgaW4gdmFycykge1xuXHQgICAgICBpID0gX21lZGlhLmluZGV4T2YocCk7XG5cdCAgICAgIGZ1bmMgPSB2YXJzW3BdO1xuXHQgICAgICBfY3JlYXRpbmdNZWRpYSA9IHA7XG5cblx0ICAgICAgaWYgKHAgPT09IFwiYWxsXCIpIHtcblx0ICAgICAgICBmdW5jKCk7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgbXEgPSBfd2luLm1hdGNoTWVkaWEocCk7XG5cblx0ICAgICAgICBpZiAobXEpIHtcblx0ICAgICAgICAgIG1xLm1hdGNoZXMgJiYgKHJlc3VsdCA9IGZ1bmMoKSk7XG5cblx0ICAgICAgICAgIGlmICh+aSkge1xuXHQgICAgICAgICAgICBfbWVkaWFbaSArIDFdID0gX2NvbWJpbmVGdW5jKF9tZWRpYVtpICsgMV0sIGZ1bmMpO1xuXHQgICAgICAgICAgICBfbWVkaWFbaSArIDJdID0gX2NvbWJpbmVGdW5jKF9tZWRpYVtpICsgMl0sIHJlc3VsdCk7XG5cdCAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICBpID0gX21lZGlhLmxlbmd0aDtcblxuXHQgICAgICAgICAgICBfbWVkaWEucHVzaChwLCBmdW5jLCByZXN1bHQpO1xuXG5cdCAgICAgICAgICAgIG1xLmFkZExpc3RlbmVyID8gbXEuYWRkTGlzdGVuZXIoX29uTWVkaWFDaGFuZ2UpIDogbXEuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBfb25NZWRpYUNoYW5nZSk7XG5cdCAgICAgICAgICB9XG5cblx0ICAgICAgICAgIF9tZWRpYVtpICsgM10gPSBtcS5tYXRjaGVzO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXG5cdCAgICAgIF9jcmVhdGluZ01lZGlhID0gMDtcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIF9tZWRpYTtcblx0ICB9O1xuXG5cdCAgU2Nyb2xsVHJpZ2dlci5jbGVhck1hdGNoTWVkaWEgPSBmdW5jdGlvbiBjbGVhck1hdGNoTWVkaWEocXVlcnkpIHtcblx0ICAgIHF1ZXJ5IHx8IChfbWVkaWEubGVuZ3RoID0gMCk7XG5cdCAgICBxdWVyeSA9IF9tZWRpYS5pbmRleE9mKHF1ZXJ5KTtcblx0ICAgIHF1ZXJ5ID49IDAgJiYgX21lZGlhLnNwbGljZShxdWVyeSwgNCk7XG5cdCAgfTtcblxuXHQgIFNjcm9sbFRyaWdnZXIuaXNJblZpZXdwb3J0ID0gZnVuY3Rpb24gaXNJblZpZXdwb3J0KGVsZW1lbnQsIHJhdGlvLCBob3Jpem9udGFsKSB7XG5cdCAgICB2YXIgYm91bmRzID0gKF9pc1N0cmluZyhlbGVtZW50KSA/IF9nZXRUYXJnZXQoZWxlbWVudCkgOiBlbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcblx0ICAgICAgICBvZmZzZXQgPSBib3VuZHNbaG9yaXpvbnRhbCA/IF93aWR0aCA6IF9oZWlnaHRdICogcmF0aW8gfHwgMDtcblx0ICAgIHJldHVybiBob3Jpem9udGFsID8gYm91bmRzLnJpZ2h0IC0gb2Zmc2V0ID4gMCAmJiBib3VuZHMubGVmdCArIG9mZnNldCA8IF93aW4uaW5uZXJXaWR0aCA6IGJvdW5kcy5ib3R0b20gLSBvZmZzZXQgPiAwICYmIGJvdW5kcy50b3AgKyBvZmZzZXQgPCBfd2luLmlubmVySGVpZ2h0O1xuXHQgIH07XG5cblx0ICBTY3JvbGxUcmlnZ2VyLnBvc2l0aW9uSW5WaWV3cG9ydCA9IGZ1bmN0aW9uIHBvc2l0aW9uSW5WaWV3cG9ydChlbGVtZW50LCByZWZlcmVuY2VQb2ludCwgaG9yaXpvbnRhbCkge1xuXHQgICAgX2lzU3RyaW5nKGVsZW1lbnQpICYmIChlbGVtZW50ID0gX2dldFRhcmdldChlbGVtZW50KSk7XG5cdCAgICB2YXIgYm91bmRzID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcblx0ICAgICAgICBzaXplID0gYm91bmRzW2hvcml6b250YWwgPyBfd2lkdGggOiBfaGVpZ2h0XSxcblx0ICAgICAgICBvZmZzZXQgPSByZWZlcmVuY2VQb2ludCA9PSBudWxsID8gc2l6ZSAvIDIgOiByZWZlcmVuY2VQb2ludCBpbiBfa2V5d29yZHMgPyBfa2V5d29yZHNbcmVmZXJlbmNlUG9pbnRdICogc2l6ZSA6IH5yZWZlcmVuY2VQb2ludC5pbmRleE9mKFwiJVwiKSA/IHBhcnNlRmxvYXQocmVmZXJlbmNlUG9pbnQpICogc2l6ZSAvIDEwMCA6IHBhcnNlRmxvYXQocmVmZXJlbmNlUG9pbnQpIHx8IDA7XG5cdCAgICByZXR1cm4gaG9yaXpvbnRhbCA/IChib3VuZHMubGVmdCArIG9mZnNldCkgLyBfd2luLmlubmVyV2lkdGggOiAoYm91bmRzLnRvcCArIG9mZnNldCkgLyBfd2luLmlubmVySGVpZ2h0O1xuXHQgIH07XG5cblx0ICByZXR1cm4gU2Nyb2xsVHJpZ2dlcjtcblx0fSgpO1xuXHRTY3JvbGxUcmlnZ2VyLnZlcnNpb24gPSBcIjMuOS4xXCI7XG5cblx0U2Nyb2xsVHJpZ2dlci5zYXZlU3R5bGVzID0gZnVuY3Rpb24gKHRhcmdldHMpIHtcblx0ICByZXR1cm4gdGFyZ2V0cyA/IF90b0FycmF5KHRhcmdldHMpLmZvckVhY2goZnVuY3Rpb24gKHRhcmdldCkge1xuXHQgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuc3R5bGUpIHtcblx0ICAgICAgdmFyIGkgPSBfc2F2ZWRTdHlsZXMuaW5kZXhPZih0YXJnZXQpO1xuXG5cdCAgICAgIGkgPj0gMCAmJiBfc2F2ZWRTdHlsZXMuc3BsaWNlKGksIDUpO1xuXG5cdCAgICAgIF9zYXZlZFN0eWxlcy5wdXNoKHRhcmdldCwgdGFyZ2V0LnN0eWxlLmNzc1RleHQsIHRhcmdldC5nZXRCQm94ICYmIHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiksIGdzYXAuY29yZS5nZXRDYWNoZSh0YXJnZXQpLCBfY3JlYXRpbmdNZWRpYSk7XG5cdCAgICB9XG5cdCAgfSkgOiBfc2F2ZWRTdHlsZXM7XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5yZXZlcnQgPSBmdW5jdGlvbiAoc29mdCwgbWVkaWEpIHtcblx0ICByZXR1cm4gX3JldmVydEFsbCghc29mdCwgbWVkaWEpO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIuY3JlYXRlID0gZnVuY3Rpb24gKHZhcnMsIGFuaW1hdGlvbikge1xuXHQgIHJldHVybiBuZXcgU2Nyb2xsVHJpZ2dlcih2YXJzLCBhbmltYXRpb24pO1xuXHR9O1xuXG5cdFNjcm9sbFRyaWdnZXIucmVmcmVzaCA9IGZ1bmN0aW9uIChzYWZlKSB7XG5cdCAgcmV0dXJuIHNhZmUgPyBfb25SZXNpemUoKSA6IChfY29yZUluaXR0ZWQgfHwgU2Nyb2xsVHJpZ2dlci5yZWdpc3RlcigpKSAmJiBfcmVmcmVzaEFsbCh0cnVlKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLnVwZGF0ZSA9IF91cGRhdGVBbGw7XG5cdFNjcm9sbFRyaWdnZXIuY2xlYXJTY3JvbGxNZW1vcnkgPSBfY2xlYXJTY3JvbGxNZW1vcnk7XG5cblx0U2Nyb2xsVHJpZ2dlci5tYXhTY3JvbGwgPSBmdW5jdGlvbiAoZWxlbWVudCwgaG9yaXpvbnRhbCkge1xuXHQgIHJldHVybiBfbWF4U2Nyb2xsKGVsZW1lbnQsIGhvcml6b250YWwgPyBfaG9yaXpvbnRhbCA6IF92ZXJ0aWNhbCk7XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5nZXRTY3JvbGxGdW5jID0gZnVuY3Rpb24gKGVsZW1lbnQsIGhvcml6b250YWwpIHtcblx0ICByZXR1cm4gX2dldFNjcm9sbEZ1bmMoX2dldFRhcmdldChlbGVtZW50KSwgaG9yaXpvbnRhbCA/IF9ob3Jpem9udGFsIDogX3ZlcnRpY2FsKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLmdldEJ5SWQgPSBmdW5jdGlvbiAoaWQpIHtcblx0ICByZXR1cm4gX2lkc1tpZF07XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5nZXRBbGwgPSBmdW5jdGlvbiAoKSB7XG5cdCAgcmV0dXJuIF90cmlnZ2Vycy5zbGljZSgwKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLmlzU2Nyb2xsaW5nID0gZnVuY3Rpb24gKCkge1xuXHQgIHJldHVybiAhIV9sYXN0U2Nyb2xsVGltZTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLnNuYXBEaXJlY3Rpb25hbCA9IF9zbmFwRGlyZWN0aW9uYWw7XG5cblx0U2Nyb2xsVHJpZ2dlci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGNhbGxiYWNrKSB7XG5cdCAgdmFyIGEgPSBfbGlzdGVuZXJzW3R5cGVdIHx8IChfbGlzdGVuZXJzW3R5cGVdID0gW10pO1xuXHQgIH5hLmluZGV4T2YoY2FsbGJhY2spIHx8IGEucHVzaChjYWxsYmFjayk7XG5cdH07XG5cblx0U2Nyb2xsVHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGNhbGxiYWNrKSB7XG5cdCAgdmFyIGEgPSBfbGlzdGVuZXJzW3R5cGVdLFxuXHQgICAgICBpID0gYSAmJiBhLmluZGV4T2YoY2FsbGJhY2spO1xuXHQgIGkgPj0gMCAmJiBhLnNwbGljZShpLCAxKTtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLmJhdGNoID0gZnVuY3Rpb24gKHRhcmdldHMsIHZhcnMpIHtcblx0ICB2YXIgcmVzdWx0ID0gW10sXG5cdCAgICAgIHZhcnNDb3B5ID0ge30sXG5cdCAgICAgIGludGVydmFsID0gdmFycy5pbnRlcnZhbCB8fCAwLjAxNixcblx0ICAgICAgYmF0Y2hNYXggPSB2YXJzLmJhdGNoTWF4IHx8IDFlOSxcblx0ICAgICAgcHJveHlDYWxsYmFjayA9IGZ1bmN0aW9uIHByb3h5Q2FsbGJhY2sodHlwZSwgY2FsbGJhY2spIHtcblx0ICAgIHZhciBlbGVtZW50cyA9IFtdLFxuXHQgICAgICAgIHRyaWdnZXJzID0gW10sXG5cdCAgICAgICAgZGVsYXkgPSBnc2FwLmRlbGF5ZWRDYWxsKGludGVydmFsLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGNhbGxiYWNrKGVsZW1lbnRzLCB0cmlnZ2Vycyk7XG5cdCAgICAgIGVsZW1lbnRzID0gW107XG5cdCAgICAgIHRyaWdnZXJzID0gW107XG5cdCAgICB9KS5wYXVzZSgpO1xuXHQgICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxmKSB7XG5cdCAgICAgIGVsZW1lbnRzLmxlbmd0aCB8fCBkZWxheS5yZXN0YXJ0KHRydWUpO1xuXHQgICAgICBlbGVtZW50cy5wdXNoKHNlbGYudHJpZ2dlcik7XG5cdCAgICAgIHRyaWdnZXJzLnB1c2goc2VsZik7XG5cdCAgICAgIGJhdGNoTWF4IDw9IGVsZW1lbnRzLmxlbmd0aCAmJiBkZWxheS5wcm9ncmVzcygxKTtcblx0ICAgIH07XG5cdCAgfSxcblx0ICAgICAgcDtcblxuXHQgIGZvciAocCBpbiB2YXJzKSB7XG5cdCAgICB2YXJzQ29weVtwXSA9IHAuc3Vic3RyKDAsIDIpID09PSBcIm9uXCIgJiYgX2lzRnVuY3Rpb24odmFyc1twXSkgJiYgcCAhPT0gXCJvblJlZnJlc2hJbml0XCIgPyBwcm94eUNhbGxiYWNrKHAsIHZhcnNbcF0pIDogdmFyc1twXTtcblx0ICB9XG5cblx0ICBpZiAoX2lzRnVuY3Rpb24oYmF0Y2hNYXgpKSB7XG5cdCAgICBiYXRjaE1heCA9IGJhdGNoTWF4KCk7XG5cblx0ICAgIF9hZGRMaXN0ZW5lcihTY3JvbGxUcmlnZ2VyLCBcInJlZnJlc2hcIiwgZnVuY3Rpb24gKCkge1xuXHQgICAgICByZXR1cm4gYmF0Y2hNYXggPSB2YXJzLmJhdGNoTWF4KCk7XG5cdCAgICB9KTtcblx0ICB9XG5cblx0ICBfdG9BcnJheSh0YXJnZXRzKS5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQpIHtcblx0ICAgIHZhciBjb25maWcgPSB7fTtcblxuXHQgICAgZm9yIChwIGluIHZhcnNDb3B5KSB7XG5cdCAgICAgIGNvbmZpZ1twXSA9IHZhcnNDb3B5W3BdO1xuXHQgICAgfVxuXG5cdCAgICBjb25maWcudHJpZ2dlciA9IHRhcmdldDtcblx0ICAgIHJlc3VsdC5wdXNoKFNjcm9sbFRyaWdnZXIuY3JlYXRlKGNvbmZpZykpO1xuXHQgIH0pO1xuXG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRTY3JvbGxUcmlnZ2VyLnNvcnQgPSBmdW5jdGlvbiAoZnVuYykge1xuXHQgIHJldHVybiBfdHJpZ2dlcnMuc29ydChmdW5jIHx8IGZ1bmN0aW9uIChhLCBiKSB7XG5cdCAgICByZXR1cm4gKGEudmFycy5yZWZyZXNoUHJpb3JpdHkgfHwgMCkgKiAtMWU2ICsgYS5zdGFydCAtIChiLnN0YXJ0ICsgKGIudmFycy5yZWZyZXNoUHJpb3JpdHkgfHwgMCkgKiAtMWU2KTtcblx0ICB9KTtcblx0fTtcblxuXHRfZ2V0R1NBUCgpICYmIGdzYXAucmVnaXN0ZXJQbHVnaW4oU2Nyb2xsVHJpZ2dlcik7XG5cblx0ZXhwb3J0cy5TY3JvbGxUcmlnZ2VyID0gU2Nyb2xsVHJpZ2dlcjtcblx0ZXhwb3J0cy5kZWZhdWx0ID0gU2Nyb2xsVHJpZ2dlcjtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZ2xvYmFsID0gZ2xvYmFsIHx8IHNlbGYsIGZhY3RvcnkoZ2xvYmFsLndpbmRvdyA9IGdsb2JhbC53aW5kb3cgfHwge30pKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICAgIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpO1xuICAgIHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzO1xuICAgIHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG4gIH1cblxuICBmdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHtcbiAgICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAvKiFcbiAgICogR1NBUCAzLjkuMVxuICAgKiBodHRwczovL2dyZWVuc29jay5jb21cbiAgICpcbiAgICogQGxpY2Vuc2UgQ29weXJpZ2h0IDIwMDgtMjAyMSwgR3JlZW5Tb2NrLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAgKiBTdWJqZWN0IHRvIHRoZSB0ZXJtcyBhdCBodHRwczovL2dyZWVuc29jay5jb20vc3RhbmRhcmQtbGljZW5zZSBvciBmb3JcbiAgICogQ2x1YiBHcmVlblNvY2sgbWVtYmVycywgdGhlIGFncmVlbWVudCBpc3N1ZWQgd2l0aCB0aGF0IG1lbWJlcnNoaXAuXG4gICAqIEBhdXRob3I6IEphY2sgRG95bGUsIGphY2tAZ3JlZW5zb2NrLmNvbVxuICAqL1xuICB2YXIgX2NvbmZpZyA9IHtcbiAgICBhdXRvU2xlZXA6IDEyMCxcbiAgICBmb3JjZTNEOiBcImF1dG9cIixcbiAgICBudWxsVGFyZ2V0V2FybjogMSxcbiAgICB1bml0czoge1xuICAgICAgbGluZUhlaWdodDogXCJcIlxuICAgIH1cbiAgfSxcbiAgICAgIF9kZWZhdWx0cyA9IHtcbiAgICBkdXJhdGlvbjogLjUsXG4gICAgb3ZlcndyaXRlOiBmYWxzZSxcbiAgICBkZWxheTogMFxuICB9LFxuICAgICAgX3N1cHByZXNzT3ZlcndyaXRlcyxcbiAgICAgIF9iaWdOdW0gPSAxZTgsXG4gICAgICBfdGlueU51bSA9IDEgLyBfYmlnTnVtLFxuICAgICAgXzJQSSA9IE1hdGguUEkgKiAyLFxuICAgICAgX0hBTEZfUEkgPSBfMlBJIC8gNCxcbiAgICAgIF9nc0lEID0gMCxcbiAgICAgIF9zcXJ0ID0gTWF0aC5zcXJ0LFxuICAgICAgX2NvcyA9IE1hdGguY29zLFxuICAgICAgX3NpbiA9IE1hdGguc2luLFxuICAgICAgX2lzU3RyaW5nID0gZnVuY3Rpb24gX2lzU3RyaW5nKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIjtcbiAgfSxcbiAgICAgIF9pc0Z1bmN0aW9uID0gZnVuY3Rpb24gX2lzRnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCI7XG4gIH0sXG4gICAgICBfaXNOdW1iZXIgPSBmdW5jdGlvbiBfaXNOdW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiO1xuICB9LFxuICAgICAgX2lzVW5kZWZpbmVkID0gZnVuY3Rpb24gX2lzVW5kZWZpbmVkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIjtcbiAgfSxcbiAgICAgIF9pc09iamVjdCA9IGZ1bmN0aW9uIF9pc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCI7XG4gIH0sXG4gICAgICBfaXNOb3RGYWxzZSA9IGZ1bmN0aW9uIF9pc05vdEZhbHNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBmYWxzZTtcbiAgfSxcbiAgICAgIF93aW5kb3dFeGlzdHMgPSBmdW5jdGlvbiBfd2luZG93RXhpc3RzKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiO1xuICB9LFxuICAgICAgX2lzRnVuY09yU3RyaW5nID0gZnVuY3Rpb24gX2lzRnVuY09yU3RyaW5nKHZhbHVlKSB7XG4gICAgcmV0dXJuIF9pc0Z1bmN0aW9uKHZhbHVlKSB8fCBfaXNTdHJpbmcodmFsdWUpO1xuICB9LFxuICAgICAgX2lzVHlwZWRBcnJheSA9IHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gXCJmdW5jdGlvblwiICYmIEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbiAoKSB7fSxcbiAgICAgIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSxcbiAgICAgIF9zdHJpY3ROdW1FeHAgPSAvKD86LT9cXC4/XFxkfFxcLikrL2dpLFxuICAgICAgX251bUV4cCA9IC9bLSs9Ll0qXFxkK1suZVxcLStdKlxcZCpbZVxcLStdKlxcZCovZyxcbiAgICAgIF9udW1XaXRoVW5pdEV4cCA9IC9bLSs9Ll0qXFxkK1suZS1dKlxcZCpbYS16JV0qL2csXG4gICAgICBfY29tcGxleFN0cmluZ051bUV4cCA9IC9bLSs9Ll0qXFxkK1xcLj9cXGQqKD86ZS18ZVxcKyk/XFxkKi9naSxcbiAgICAgIF9yZWxFeHAgPSAvWystXT0tP1suXFxkXSsvLFxuICAgICAgX2RlbGltaXRlZFZhbHVlRXhwID0gL1teLCdcIlxcW1xcXVxcc10rL2dpLFxuICAgICAgX3VuaXRFeHAgPSAvW1xcZC4rXFwtPV0rKD86ZVstK11cXGQqKSovaSxcbiAgICAgIF9nbG9iYWxUaW1lbGluZSxcbiAgICAgIF93aW4sXG4gICAgICBfY29yZUluaXR0ZWQsXG4gICAgICBfZG9jLFxuICAgICAgX2dsb2JhbHMgPSB7fSxcbiAgICAgIF9pbnN0YWxsU2NvcGUgPSB7fSxcbiAgICAgIF9jb3JlUmVhZHksXG4gICAgICBfaW5zdGFsbCA9IGZ1bmN0aW9uIF9pbnN0YWxsKHNjb3BlKSB7XG4gICAgcmV0dXJuIChfaW5zdGFsbFNjb3BlID0gX21lcmdlKHNjb3BlLCBfZ2xvYmFscykpICYmIGdzYXA7XG4gIH0sXG4gICAgICBfbWlzc2luZ1BsdWdpbiA9IGZ1bmN0aW9uIF9taXNzaW5nUGx1Z2luKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiBjb25zb2xlLndhcm4oXCJJbnZhbGlkIHByb3BlcnR5XCIsIHByb3BlcnR5LCBcInNldCB0b1wiLCB2YWx1ZSwgXCJNaXNzaW5nIHBsdWdpbj8gZ3NhcC5yZWdpc3RlclBsdWdpbigpXCIpO1xuICB9LFxuICAgICAgX3dhcm4gPSBmdW5jdGlvbiBfd2FybihtZXNzYWdlLCBzdXBwcmVzcykge1xuICAgIHJldHVybiAhc3VwcHJlc3MgJiYgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICB9LFxuICAgICAgX2FkZEdsb2JhbCA9IGZ1bmN0aW9uIF9hZGRHbG9iYWwobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIG5hbWUgJiYgKF9nbG9iYWxzW25hbWVdID0gb2JqKSAmJiBfaW5zdGFsbFNjb3BlICYmIChfaW5zdGFsbFNjb3BlW25hbWVdID0gb2JqKSB8fCBfZ2xvYmFscztcbiAgfSxcbiAgICAgIF9lbXB0eUZ1bmMgPSBmdW5jdGlvbiBfZW1wdHlGdW5jKCkge1xuICAgIHJldHVybiAwO1xuICB9LFxuICAgICAgX3Jlc2VydmVkUHJvcHMgPSB7fSxcbiAgICAgIF9sYXp5VHdlZW5zID0gW10sXG4gICAgICBfbGF6eUxvb2t1cCA9IHt9LFxuICAgICAgX2xhc3RSZW5kZXJlZEZyYW1lLFxuICAgICAgX3BsdWdpbnMgPSB7fSxcbiAgICAgIF9lZmZlY3RzID0ge30sXG4gICAgICBfbmV4dEdDRnJhbWUgPSAzMCxcbiAgICAgIF9oYXJuZXNzUGx1Z2lucyA9IFtdLFxuICAgICAgX2NhbGxiYWNrTmFtZXMgPSBcIlwiLFxuICAgICAgX2hhcm5lc3MgPSBmdW5jdGlvbiBfaGFybmVzcyh0YXJnZXRzKSB7XG4gICAgdmFyIHRhcmdldCA9IHRhcmdldHNbMF0sXG4gICAgICAgIGhhcm5lc3NQbHVnaW4sXG4gICAgICAgIGk7XG4gICAgX2lzT2JqZWN0KHRhcmdldCkgfHwgX2lzRnVuY3Rpb24odGFyZ2V0KSB8fCAodGFyZ2V0cyA9IFt0YXJnZXRzXSk7XG5cbiAgICBpZiAoIShoYXJuZXNzUGx1Z2luID0gKHRhcmdldC5fZ3NhcCB8fCB7fSkuaGFybmVzcykpIHtcbiAgICAgIGkgPSBfaGFybmVzc1BsdWdpbnMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tICYmICFfaGFybmVzc1BsdWdpbnNbaV0udGFyZ2V0VGVzdCh0YXJnZXQpKSB7fVxuXG4gICAgICBoYXJuZXNzUGx1Z2luID0gX2hhcm5lc3NQbHVnaW5zW2ldO1xuICAgIH1cblxuICAgIGkgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRhcmdldHNbaV0gJiYgKHRhcmdldHNbaV0uX2dzYXAgfHwgKHRhcmdldHNbaV0uX2dzYXAgPSBuZXcgR1NDYWNoZSh0YXJnZXRzW2ldLCBoYXJuZXNzUGx1Z2luKSkpIHx8IHRhcmdldHMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRzO1xuICB9LFxuICAgICAgX2dldENhY2hlID0gZnVuY3Rpb24gX2dldENhY2hlKHRhcmdldCkge1xuICAgIHJldHVybiB0YXJnZXQuX2dzYXAgfHwgX2hhcm5lc3ModG9BcnJheSh0YXJnZXQpKVswXS5fZ3NhcDtcbiAgfSxcbiAgICAgIF9nZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uIF9nZXRQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5LCB2KSB7XG4gICAgcmV0dXJuICh2ID0gdGFyZ2V0W3Byb3BlcnR5XSkgJiYgX2lzRnVuY3Rpb24odikgPyB0YXJnZXRbcHJvcGVydHldKCkgOiBfaXNVbmRlZmluZWQodikgJiYgdGFyZ2V0LmdldEF0dHJpYnV0ZSAmJiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3BlcnR5KSB8fCB2O1xuICB9LFxuICAgICAgX2ZvckVhY2hOYW1lID0gZnVuY3Rpb24gX2ZvckVhY2hOYW1lKG5hbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIChuYW1lcyA9IG5hbWVzLnNwbGl0KFwiLFwiKSkuZm9yRWFjaChmdW5jKSB8fCBuYW1lcztcbiAgfSxcbiAgICAgIF9yb3VuZCA9IGZ1bmN0aW9uIF9yb3VuZCh2YWx1ZSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogMTAwMDAwKSAvIDEwMDAwMCB8fCAwO1xuICB9LFxuICAgICAgX3JvdW5kUHJlY2lzZSA9IGZ1bmN0aW9uIF9yb3VuZFByZWNpc2UodmFsdWUpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMDAwMDAwKSAvIDEwMDAwMDAwIHx8IDA7XG4gIH0sXG4gICAgICBfYXJyYXlDb250YWluc0FueSA9IGZ1bmN0aW9uIF9hcnJheUNvbnRhaW5zQW55KHRvU2VhcmNoLCB0b0ZpbmQpIHtcbiAgICB2YXIgbCA9IHRvRmluZC5sZW5ndGgsXG4gICAgICAgIGkgPSAwO1xuXG4gICAgZm9yICg7IHRvU2VhcmNoLmluZGV4T2YodG9GaW5kW2ldKSA8IDAgJiYgKytpIDwgbDspIHt9XG5cbiAgICByZXR1cm4gaSA8IGw7XG4gIH0sXG4gICAgICBfbGF6eVJlbmRlciA9IGZ1bmN0aW9uIF9sYXp5UmVuZGVyKCkge1xuICAgIHZhciBsID0gX2xhenlUd2VlbnMubGVuZ3RoLFxuICAgICAgICBhID0gX2xhenlUd2VlbnMuc2xpY2UoMCksXG4gICAgICAgIGksXG4gICAgICAgIHR3ZWVuO1xuXG4gICAgX2xhenlMb29rdXAgPSB7fTtcbiAgICBfbGF6eVR3ZWVucy5sZW5ndGggPSAwO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdHdlZW4gPSBhW2ldO1xuICAgICAgdHdlZW4gJiYgdHdlZW4uX2xhenkgJiYgKHR3ZWVuLnJlbmRlcih0d2Vlbi5fbGF6eVswXSwgdHdlZW4uX2xhenlbMV0sIHRydWUpLl9sYXp5ID0gMCk7XG4gICAgfVxuICB9LFxuICAgICAgX2xhenlTYWZlUmVuZGVyID0gZnVuY3Rpb24gX2xhenlTYWZlUmVuZGVyKGFuaW1hdGlvbiwgdGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKSB7XG4gICAgX2xhenlUd2VlbnMubGVuZ3RoICYmIF9sYXp5UmVuZGVyKCk7XG4gICAgYW5pbWF0aW9uLnJlbmRlcih0aW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpO1xuICAgIF9sYXp5VHdlZW5zLmxlbmd0aCAmJiBfbGF6eVJlbmRlcigpO1xuICB9LFxuICAgICAgX251bWVyaWNJZlBvc3NpYmxlID0gZnVuY3Rpb24gX251bWVyaWNJZlBvc3NpYmxlKHZhbHVlKSB7XG4gICAgdmFyIG4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICByZXR1cm4gKG4gfHwgbiA9PT0gMCkgJiYgKHZhbHVlICsgXCJcIikubWF0Y2goX2RlbGltaXRlZFZhbHVlRXhwKS5sZW5ndGggPCAyID8gbiA6IF9pc1N0cmluZyh2YWx1ZSkgPyB2YWx1ZS50cmltKCkgOiB2YWx1ZTtcbiAgfSxcbiAgICAgIF9wYXNzVGhyb3VnaCA9IGZ1bmN0aW9uIF9wYXNzVGhyb3VnaChwKSB7XG4gICAgcmV0dXJuIHA7XG4gIH0sXG4gICAgICBfc2V0RGVmYXVsdHMgPSBmdW5jdGlvbiBfc2V0RGVmYXVsdHMob2JqLCBkZWZhdWx0cykge1xuICAgIGZvciAodmFyIHAgaW4gZGVmYXVsdHMpIHtcbiAgICAgIHAgaW4gb2JqIHx8IChvYmpbcF0gPSBkZWZhdWx0c1twXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgICAgIF9zZXRLZXlmcmFtZURlZmF1bHRzID0gZnVuY3Rpb24gX3NldEtleWZyYW1lRGVmYXVsdHMoZXhjbHVkZUR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gICAgICBmb3IgKHZhciBwIGluIGRlZmF1bHRzKSB7XG4gICAgICAgIHAgaW4gb2JqIHx8IHAgPT09IFwiZHVyYXRpb25cIiAmJiBleGNsdWRlRHVyYXRpb24gfHwgcCA9PT0gXCJlYXNlXCIgfHwgKG9ialtwXSA9IGRlZmF1bHRzW3BdKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICAgICAgX21lcmdlID0gZnVuY3Rpb24gX21lcmdlKGJhc2UsIHRvTWVyZ2UpIHtcbiAgICBmb3IgKHZhciBwIGluIHRvTWVyZ2UpIHtcbiAgICAgIGJhc2VbcF0gPSB0b01lcmdlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiBiYXNlO1xuICB9LFxuICAgICAgX21lcmdlRGVlcCA9IGZ1bmN0aW9uIF9tZXJnZURlZXAoYmFzZSwgdG9NZXJnZSkge1xuICAgIGZvciAodmFyIHAgaW4gdG9NZXJnZSkge1xuICAgICAgcCAhPT0gXCJfX3Byb3RvX19cIiAmJiBwICE9PSBcImNvbnN0cnVjdG9yXCIgJiYgcCAhPT0gXCJwcm90b3R5cGVcIiAmJiAoYmFzZVtwXSA9IF9pc09iamVjdCh0b01lcmdlW3BdKSA/IF9tZXJnZURlZXAoYmFzZVtwXSB8fCAoYmFzZVtwXSA9IHt9KSwgdG9NZXJnZVtwXSkgOiB0b01lcmdlW3BdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmFzZTtcbiAgfSxcbiAgICAgIF9jb3B5RXhjbHVkaW5nID0gZnVuY3Rpb24gX2NvcHlFeGNsdWRpbmcob2JqLCBleGNsdWRpbmcpIHtcbiAgICB2YXIgY29weSA9IHt9LFxuICAgICAgICBwO1xuXG4gICAgZm9yIChwIGluIG9iaikge1xuICAgICAgcCBpbiBleGNsdWRpbmcgfHwgKGNvcHlbcF0gPSBvYmpbcF0pO1xuICAgIH1cblxuICAgIHJldHVybiBjb3B5O1xuICB9LFxuICAgICAgX2luaGVyaXREZWZhdWx0cyA9IGZ1bmN0aW9uIF9pbmhlcml0RGVmYXVsdHModmFycykge1xuICAgIHZhciBwYXJlbnQgPSB2YXJzLnBhcmVudCB8fCBfZ2xvYmFsVGltZWxpbmUsXG4gICAgICAgIGZ1bmMgPSB2YXJzLmtleWZyYW1lcyA/IF9zZXRLZXlmcmFtZURlZmF1bHRzKF9pc0FycmF5KHZhcnMua2V5ZnJhbWVzKSkgOiBfc2V0RGVmYXVsdHM7XG5cbiAgICBpZiAoX2lzTm90RmFsc2UodmFycy5pbmhlcml0KSkge1xuICAgICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgICBmdW5jKHZhcnMsIHBhcmVudC52YXJzLmRlZmF1bHRzKTtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudCB8fCBwYXJlbnQuX2RwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YXJzO1xuICB9LFxuICAgICAgX2FycmF5c01hdGNoID0gZnVuY3Rpb24gX2FycmF5c01hdGNoKGExLCBhMikge1xuICAgIHZhciBpID0gYTEubGVuZ3RoLFxuICAgICAgICBtYXRjaCA9IGkgPT09IGEyLmxlbmd0aDtcblxuICAgIHdoaWxlIChtYXRjaCAmJiBpLS0gJiYgYTFbaV0gPT09IGEyW2ldKSB7fVxuXG4gICAgcmV0dXJuIGkgPCAwO1xuICB9LFxuICAgICAgX2FkZExpbmtlZExpc3RJdGVtID0gZnVuY3Rpb24gX2FkZExpbmtlZExpc3RJdGVtKHBhcmVudCwgY2hpbGQsIGZpcnN0UHJvcCwgbGFzdFByb3AsIHNvcnRCeSkge1xuICAgIGlmIChmaXJzdFByb3AgPT09IHZvaWQgMCkge1xuICAgICAgZmlyc3RQcm9wID0gXCJfZmlyc3RcIjtcbiAgICB9XG5cbiAgICBpZiAobGFzdFByb3AgPT09IHZvaWQgMCkge1xuICAgICAgbGFzdFByb3AgPSBcIl9sYXN0XCI7XG4gICAgfVxuXG4gICAgdmFyIHByZXYgPSBwYXJlbnRbbGFzdFByb3BdLFxuICAgICAgICB0O1xuXG4gICAgaWYgKHNvcnRCeSkge1xuICAgICAgdCA9IGNoaWxkW3NvcnRCeV07XG5cbiAgICAgIHdoaWxlIChwcmV2ICYmIHByZXZbc29ydEJ5XSA+IHQpIHtcbiAgICAgICAgcHJldiA9IHByZXYuX3ByZXY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByZXYpIHtcbiAgICAgIGNoaWxkLl9uZXh0ID0gcHJldi5fbmV4dDtcbiAgICAgIHByZXYuX25leHQgPSBjaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuX25leHQgPSBwYXJlbnRbZmlyc3RQcm9wXTtcbiAgICAgIHBhcmVudFtmaXJzdFByb3BdID0gY2hpbGQ7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkLl9uZXh0KSB7XG4gICAgICBjaGlsZC5fbmV4dC5fcHJldiA9IGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRbbGFzdFByb3BdID0gY2hpbGQ7XG4gICAgfVxuXG4gICAgY2hpbGQuX3ByZXYgPSBwcmV2O1xuICAgIGNoaWxkLnBhcmVudCA9IGNoaWxkLl9kcCA9IHBhcmVudDtcbiAgICByZXR1cm4gY2hpbGQ7XG4gIH0sXG4gICAgICBfcmVtb3ZlTGlua2VkTGlzdEl0ZW0gPSBmdW5jdGlvbiBfcmVtb3ZlTGlua2VkTGlzdEl0ZW0ocGFyZW50LCBjaGlsZCwgZmlyc3RQcm9wLCBsYXN0UHJvcCkge1xuICAgIGlmIChmaXJzdFByb3AgPT09IHZvaWQgMCkge1xuICAgICAgZmlyc3RQcm9wID0gXCJfZmlyc3RcIjtcbiAgICB9XG5cbiAgICBpZiAobGFzdFByb3AgPT09IHZvaWQgMCkge1xuICAgICAgbGFzdFByb3AgPSBcIl9sYXN0XCI7XG4gICAgfVxuXG4gICAgdmFyIHByZXYgPSBjaGlsZC5fcHJldixcbiAgICAgICAgbmV4dCA9IGNoaWxkLl9uZXh0O1xuXG4gICAgaWYgKHByZXYpIHtcbiAgICAgIHByZXYuX25leHQgPSBuZXh0O1xuICAgIH0gZWxzZSBpZiAocGFyZW50W2ZpcnN0UHJvcF0gPT09IGNoaWxkKSB7XG4gICAgICBwYXJlbnRbZmlyc3RQcm9wXSA9IG5leHQ7XG4gICAgfVxuXG4gICAgaWYgKG5leHQpIHtcbiAgICAgIG5leHQuX3ByZXYgPSBwcmV2O1xuICAgIH0gZWxzZSBpZiAocGFyZW50W2xhc3RQcm9wXSA9PT0gY2hpbGQpIHtcbiAgICAgIHBhcmVudFtsYXN0UHJvcF0gPSBwcmV2O1xuICAgIH1cblxuICAgIGNoaWxkLl9uZXh0ID0gY2hpbGQuX3ByZXYgPSBjaGlsZC5wYXJlbnQgPSBudWxsO1xuICB9LFxuICAgICAgX3JlbW92ZUZyb21QYXJlbnQgPSBmdW5jdGlvbiBfcmVtb3ZlRnJvbVBhcmVudChjaGlsZCwgb25seUlmUGFyZW50SGFzQXV0b1JlbW92ZSkge1xuICAgIGNoaWxkLnBhcmVudCAmJiAoIW9ubHlJZlBhcmVudEhhc0F1dG9SZW1vdmUgfHwgY2hpbGQucGFyZW50LmF1dG9SZW1vdmVDaGlsZHJlbikgJiYgY2hpbGQucGFyZW50LnJlbW92ZShjaGlsZCk7XG4gICAgY2hpbGQuX2FjdCA9IDA7XG4gIH0sXG4gICAgICBfdW5jYWNoZSA9IGZ1bmN0aW9uIF91bmNhY2hlKGFuaW1hdGlvbiwgY2hpbGQpIHtcbiAgICBpZiAoYW5pbWF0aW9uICYmICghY2hpbGQgfHwgY2hpbGQuX2VuZCA+IGFuaW1hdGlvbi5fZHVyIHx8IGNoaWxkLl9zdGFydCA8IDApKSB7XG4gICAgICB2YXIgYSA9IGFuaW1hdGlvbjtcblxuICAgICAgd2hpbGUgKGEpIHtcbiAgICAgICAgYS5fZGlydHkgPSAxO1xuICAgICAgICBhID0gYS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfSxcbiAgICAgIF9yZWNhY2hlQW5jZXN0b3JzID0gZnVuY3Rpb24gX3JlY2FjaGVBbmNlc3RvcnMoYW5pbWF0aW9uKSB7XG4gICAgdmFyIHBhcmVudCA9IGFuaW1hdGlvbi5wYXJlbnQ7XG5cbiAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5wYXJlbnQpIHtcbiAgICAgIHBhcmVudC5fZGlydHkgPSAxO1xuICAgICAgcGFyZW50LnRvdGFsRHVyYXRpb24oKTtcbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfSxcbiAgICAgIF9oYXNOb1BhdXNlZEFuY2VzdG9ycyA9IGZ1bmN0aW9uIF9oYXNOb1BhdXNlZEFuY2VzdG9ycyhhbmltYXRpb24pIHtcbiAgICByZXR1cm4gIWFuaW1hdGlvbiB8fCBhbmltYXRpb24uX3RzICYmIF9oYXNOb1BhdXNlZEFuY2VzdG9ycyhhbmltYXRpb24ucGFyZW50KTtcbiAgfSxcbiAgICAgIF9lbGFwc2VkQ3ljbGVEdXJhdGlvbiA9IGZ1bmN0aW9uIF9lbGFwc2VkQ3ljbGVEdXJhdGlvbihhbmltYXRpb24pIHtcbiAgICByZXR1cm4gYW5pbWF0aW9uLl9yZXBlYXQgPyBfYW5pbWF0aW9uQ3ljbGUoYW5pbWF0aW9uLl90VGltZSwgYW5pbWF0aW9uID0gYW5pbWF0aW9uLmR1cmF0aW9uKCkgKyBhbmltYXRpb24uX3JEZWxheSkgKiBhbmltYXRpb24gOiAwO1xuICB9LFxuICAgICAgX2FuaW1hdGlvbkN5Y2xlID0gZnVuY3Rpb24gX2FuaW1hdGlvbkN5Y2xlKHRUaW1lLCBjeWNsZUR1cmF0aW9uKSB7XG4gICAgdmFyIHdob2xlID0gTWF0aC5mbG9vcih0VGltZSAvPSBjeWNsZUR1cmF0aW9uKTtcbiAgICByZXR1cm4gdFRpbWUgJiYgd2hvbGUgPT09IHRUaW1lID8gd2hvbGUgLSAxIDogd2hvbGU7XG4gIH0sXG4gICAgICBfcGFyZW50VG9DaGlsZFRvdGFsVGltZSA9IGZ1bmN0aW9uIF9wYXJlbnRUb0NoaWxkVG90YWxUaW1lKHBhcmVudFRpbWUsIGNoaWxkKSB7XG4gICAgcmV0dXJuIChwYXJlbnRUaW1lIC0gY2hpbGQuX3N0YXJ0KSAqIGNoaWxkLl90cyArIChjaGlsZC5fdHMgPj0gMCA/IDAgOiBjaGlsZC5fZGlydHkgPyBjaGlsZC50b3RhbER1cmF0aW9uKCkgOiBjaGlsZC5fdER1cik7XG4gIH0sXG4gICAgICBfc2V0RW5kID0gZnVuY3Rpb24gX3NldEVuZChhbmltYXRpb24pIHtcbiAgICByZXR1cm4gYW5pbWF0aW9uLl9lbmQgPSBfcm91bmRQcmVjaXNlKGFuaW1hdGlvbi5fc3RhcnQgKyAoYW5pbWF0aW9uLl90RHVyIC8gTWF0aC5hYnMoYW5pbWF0aW9uLl90cyB8fCBhbmltYXRpb24uX3J0cyB8fCBfdGlueU51bSkgfHwgMCkpO1xuICB9LFxuICAgICAgX2FsaWduUGxheWhlYWQgPSBmdW5jdGlvbiBfYWxpZ25QbGF5aGVhZChhbmltYXRpb24sIHRvdGFsVGltZSkge1xuICAgIHZhciBwYXJlbnQgPSBhbmltYXRpb24uX2RwO1xuXG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQuc21vb3RoQ2hpbGRUaW1pbmcgJiYgYW5pbWF0aW9uLl90cykge1xuICAgICAgYW5pbWF0aW9uLl9zdGFydCA9IF9yb3VuZFByZWNpc2UocGFyZW50Ll90aW1lIC0gKGFuaW1hdGlvbi5fdHMgPiAwID8gdG90YWxUaW1lIC8gYW5pbWF0aW9uLl90cyA6ICgoYW5pbWF0aW9uLl9kaXJ0eSA/IGFuaW1hdGlvbi50b3RhbER1cmF0aW9uKCkgOiBhbmltYXRpb24uX3REdXIpIC0gdG90YWxUaW1lKSAvIC1hbmltYXRpb24uX3RzKSk7XG5cbiAgICAgIF9zZXRFbmQoYW5pbWF0aW9uKTtcblxuICAgICAgcGFyZW50Ll9kaXJ0eSB8fCBfdW5jYWNoZShwYXJlbnQsIGFuaW1hdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfSxcbiAgICAgIF9wb3N0QWRkQ2hlY2tzID0gZnVuY3Rpb24gX3Bvc3RBZGRDaGVja3ModGltZWxpbmUsIGNoaWxkKSB7XG4gICAgdmFyIHQ7XG5cbiAgICBpZiAoY2hpbGQuX3RpbWUgfHwgY2hpbGQuX2luaXR0ZWQgJiYgIWNoaWxkLl9kdXIpIHtcbiAgICAgIHQgPSBfcGFyZW50VG9DaGlsZFRvdGFsVGltZSh0aW1lbGluZS5yYXdUaW1lKCksIGNoaWxkKTtcblxuICAgICAgaWYgKCFjaGlsZC5fZHVyIHx8IF9jbGFtcCgwLCBjaGlsZC50b3RhbER1cmF0aW9uKCksIHQpIC0gY2hpbGQuX3RUaW1lID4gX3RpbnlOdW0pIHtcbiAgICAgICAgY2hpbGQucmVuZGVyKHQsIHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfdW5jYWNoZSh0aW1lbGluZSwgY2hpbGQpLl9kcCAmJiB0aW1lbGluZS5faW5pdHRlZCAmJiB0aW1lbGluZS5fdGltZSA+PSB0aW1lbGluZS5fZHVyICYmIHRpbWVsaW5lLl90cykge1xuICAgICAgaWYgKHRpbWVsaW5lLl9kdXIgPCB0aW1lbGluZS5kdXJhdGlvbigpKSB7XG4gICAgICAgIHQgPSB0aW1lbGluZTtcblxuICAgICAgICB3aGlsZSAodC5fZHApIHtcbiAgICAgICAgICB0LnJhd1RpbWUoKSA+PSAwICYmIHQudG90YWxUaW1lKHQuX3RUaW1lKTtcbiAgICAgICAgICB0ID0gdC5fZHA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGltZWxpbmUuX3pUaW1lID0gLV90aW55TnVtO1xuICAgIH1cbiAgfSxcbiAgICAgIF9hZGRUb1RpbWVsaW5lID0gZnVuY3Rpb24gX2FkZFRvVGltZWxpbmUodGltZWxpbmUsIGNoaWxkLCBwb3NpdGlvbiwgc2tpcENoZWNrcykge1xuICAgIGNoaWxkLnBhcmVudCAmJiBfcmVtb3ZlRnJvbVBhcmVudChjaGlsZCk7XG4gICAgY2hpbGQuX3N0YXJ0ID0gX3JvdW5kUHJlY2lzZSgoX2lzTnVtYmVyKHBvc2l0aW9uKSA/IHBvc2l0aW9uIDogcG9zaXRpb24gfHwgdGltZWxpbmUgIT09IF9nbG9iYWxUaW1lbGluZSA/IF9wYXJzZVBvc2l0aW9uKHRpbWVsaW5lLCBwb3NpdGlvbiwgY2hpbGQpIDogdGltZWxpbmUuX3RpbWUpICsgY2hpbGQuX2RlbGF5KTtcbiAgICBjaGlsZC5fZW5kID0gX3JvdW5kUHJlY2lzZShjaGlsZC5fc3RhcnQgKyAoY2hpbGQudG90YWxEdXJhdGlvbigpIC8gTWF0aC5hYnMoY2hpbGQudGltZVNjYWxlKCkpIHx8IDApKTtcblxuICAgIF9hZGRMaW5rZWRMaXN0SXRlbSh0aW1lbGluZSwgY2hpbGQsIFwiX2ZpcnN0XCIsIFwiX2xhc3RcIiwgdGltZWxpbmUuX3NvcnQgPyBcIl9zdGFydFwiIDogMCk7XG5cbiAgICBfaXNGcm9tT3JGcm9tU3RhcnQoY2hpbGQpIHx8ICh0aW1lbGluZS5fcmVjZW50ID0gY2hpbGQpO1xuICAgIHNraXBDaGVja3MgfHwgX3Bvc3RBZGRDaGVja3ModGltZWxpbmUsIGNoaWxkKTtcbiAgICByZXR1cm4gdGltZWxpbmU7XG4gIH0sXG4gICAgICBfc2Nyb2xsVHJpZ2dlciA9IGZ1bmN0aW9uIF9zY3JvbGxUcmlnZ2VyKGFuaW1hdGlvbiwgdHJpZ2dlcikge1xuICAgIHJldHVybiAoX2dsb2JhbHMuU2Nyb2xsVHJpZ2dlciB8fCBfbWlzc2luZ1BsdWdpbihcInNjcm9sbFRyaWdnZXJcIiwgdHJpZ2dlcikpICYmIF9nbG9iYWxzLlNjcm9sbFRyaWdnZXIuY3JlYXRlKHRyaWdnZXIsIGFuaW1hdGlvbik7XG4gIH0sXG4gICAgICBfYXR0ZW1wdEluaXRUd2VlbiA9IGZ1bmN0aW9uIF9hdHRlbXB0SW5pdFR3ZWVuKHR3ZWVuLCB0b3RhbFRpbWUsIGZvcmNlLCBzdXBwcmVzc0V2ZW50cykge1xuICAgIF9pbml0VHdlZW4odHdlZW4sIHRvdGFsVGltZSk7XG5cbiAgICBpZiAoIXR3ZWVuLl9pbml0dGVkKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBpZiAoIWZvcmNlICYmIHR3ZWVuLl9wdCAmJiAodHdlZW4uX2R1ciAmJiB0d2Vlbi52YXJzLmxhenkgIT09IGZhbHNlIHx8ICF0d2Vlbi5fZHVyICYmIHR3ZWVuLnZhcnMubGF6eSkgJiYgX2xhc3RSZW5kZXJlZEZyYW1lICE9PSBfdGlja2VyLmZyYW1lKSB7XG4gICAgICBfbGF6eVR3ZWVucy5wdXNoKHR3ZWVuKTtcblxuICAgICAgdHdlZW4uX2xhenkgPSBbdG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50c107XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH0sXG4gICAgICBfcGFyZW50UGxheWhlYWRJc0JlZm9yZVN0YXJ0ID0gZnVuY3Rpb24gX3BhcmVudFBsYXloZWFkSXNCZWZvcmVTdGFydChfcmVmKSB7XG4gICAgdmFyIHBhcmVudCA9IF9yZWYucGFyZW50O1xuICAgIHJldHVybiBwYXJlbnQgJiYgcGFyZW50Ll90cyAmJiBwYXJlbnQuX2luaXR0ZWQgJiYgIXBhcmVudC5fbG9jayAmJiAocGFyZW50LnJhd1RpbWUoKSA8IDAgfHwgX3BhcmVudFBsYXloZWFkSXNCZWZvcmVTdGFydChwYXJlbnQpKTtcbiAgfSxcbiAgICAgIF9pc0Zyb21PckZyb21TdGFydCA9IGZ1bmN0aW9uIF9pc0Zyb21PckZyb21TdGFydChfcmVmMikge1xuICAgIHZhciBkYXRhID0gX3JlZjIuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gXCJpc0Zyb21TdGFydFwiIHx8IGRhdGEgPT09IFwiaXNTdGFydFwiO1xuICB9LFxuICAgICAgX3JlbmRlclplcm9EdXJhdGlvblR3ZWVuID0gZnVuY3Rpb24gX3JlbmRlclplcm9EdXJhdGlvblR3ZWVuKHR3ZWVuLCB0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSkge1xuICAgIHZhciBwcmV2UmF0aW8gPSB0d2Vlbi5yYXRpbyxcbiAgICAgICAgcmF0aW8gPSB0b3RhbFRpbWUgPCAwIHx8ICF0b3RhbFRpbWUgJiYgKCF0d2Vlbi5fc3RhcnQgJiYgX3BhcmVudFBsYXloZWFkSXNCZWZvcmVTdGFydCh0d2VlbikgJiYgISghdHdlZW4uX2luaXR0ZWQgJiYgX2lzRnJvbU9yRnJvbVN0YXJ0KHR3ZWVuKSkgfHwgKHR3ZWVuLl90cyA8IDAgfHwgdHdlZW4uX2RwLl90cyA8IDApICYmICFfaXNGcm9tT3JGcm9tU3RhcnQodHdlZW4pKSA/IDAgOiAxLFxuICAgICAgICByZXBlYXREZWxheSA9IHR3ZWVuLl9yRGVsYXksXG4gICAgICAgIHRUaW1lID0gMCxcbiAgICAgICAgcHQsXG4gICAgICAgIGl0ZXJhdGlvbixcbiAgICAgICAgcHJldkl0ZXJhdGlvbjtcblxuICAgIGlmIChyZXBlYXREZWxheSAmJiB0d2Vlbi5fcmVwZWF0KSB7XG4gICAgICB0VGltZSA9IF9jbGFtcCgwLCB0d2Vlbi5fdER1ciwgdG90YWxUaW1lKTtcbiAgICAgIGl0ZXJhdGlvbiA9IF9hbmltYXRpb25DeWNsZSh0VGltZSwgcmVwZWF0RGVsYXkpO1xuICAgICAgdHdlZW4uX3lveW8gJiYgaXRlcmF0aW9uICYgMSAmJiAocmF0aW8gPSAxIC0gcmF0aW8pO1xuXG4gICAgICBpZiAoaXRlcmF0aW9uICE9PSBfYW5pbWF0aW9uQ3ljbGUodHdlZW4uX3RUaW1lLCByZXBlYXREZWxheSkpIHtcbiAgICAgICAgcHJldlJhdGlvID0gMSAtIHJhdGlvO1xuICAgICAgICB0d2Vlbi52YXJzLnJlcGVhdFJlZnJlc2ggJiYgdHdlZW4uX2luaXR0ZWQgJiYgdHdlZW4uaW52YWxpZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyYXRpbyAhPT0gcHJldlJhdGlvIHx8IGZvcmNlIHx8IHR3ZWVuLl96VGltZSA9PT0gX3RpbnlOdW0gfHwgIXRvdGFsVGltZSAmJiB0d2Vlbi5felRpbWUpIHtcbiAgICAgIGlmICghdHdlZW4uX2luaXR0ZWQgJiYgX2F0dGVtcHRJbml0VHdlZW4odHdlZW4sIHRvdGFsVGltZSwgZm9yY2UsIHN1cHByZXNzRXZlbnRzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHByZXZJdGVyYXRpb24gPSB0d2Vlbi5felRpbWU7XG4gICAgICB0d2Vlbi5felRpbWUgPSB0b3RhbFRpbWUgfHwgKHN1cHByZXNzRXZlbnRzID8gX3RpbnlOdW0gOiAwKTtcbiAgICAgIHN1cHByZXNzRXZlbnRzIHx8IChzdXBwcmVzc0V2ZW50cyA9IHRvdGFsVGltZSAmJiAhcHJldkl0ZXJhdGlvbik7XG4gICAgICB0d2Vlbi5yYXRpbyA9IHJhdGlvO1xuICAgICAgdHdlZW4uX2Zyb20gJiYgKHJhdGlvID0gMSAtIHJhdGlvKTtcbiAgICAgIHR3ZWVuLl90aW1lID0gMDtcbiAgICAgIHR3ZWVuLl90VGltZSA9IHRUaW1lO1xuICAgICAgcHQgPSB0d2Vlbi5fcHQ7XG5cbiAgICAgIHdoaWxlIChwdCkge1xuICAgICAgICBwdC5yKHJhdGlvLCBwdC5kKTtcbiAgICAgICAgcHQgPSBwdC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgdHdlZW4uX3N0YXJ0QXQgJiYgdG90YWxUaW1lIDwgMCAmJiB0d2Vlbi5fc3RhcnRBdC5yZW5kZXIodG90YWxUaW1lLCB0cnVlLCB0cnVlKTtcbiAgICAgIHR3ZWVuLl9vblVwZGF0ZSAmJiAhc3VwcHJlc3NFdmVudHMgJiYgX2NhbGxiYWNrKHR3ZWVuLCBcIm9uVXBkYXRlXCIpO1xuICAgICAgdFRpbWUgJiYgdHdlZW4uX3JlcGVhdCAmJiAhc3VwcHJlc3NFdmVudHMgJiYgdHdlZW4ucGFyZW50ICYmIF9jYWxsYmFjayh0d2VlbiwgXCJvblJlcGVhdFwiKTtcblxuICAgICAgaWYgKCh0b3RhbFRpbWUgPj0gdHdlZW4uX3REdXIgfHwgdG90YWxUaW1lIDwgMCkgJiYgdHdlZW4ucmF0aW8gPT09IHJhdGlvKSB7XG4gICAgICAgIHJhdGlvICYmIF9yZW1vdmVGcm9tUGFyZW50KHR3ZWVuLCAxKTtcblxuICAgICAgICBpZiAoIXN1cHByZXNzRXZlbnRzKSB7XG4gICAgICAgICAgX2NhbGxiYWNrKHR3ZWVuLCByYXRpbyA/IFwib25Db21wbGV0ZVwiIDogXCJvblJldmVyc2VDb21wbGV0ZVwiLCB0cnVlKTtcblxuICAgICAgICAgIHR3ZWVuLl9wcm9tICYmIHR3ZWVuLl9wcm9tKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0d2Vlbi5felRpbWUpIHtcbiAgICAgIHR3ZWVuLl96VGltZSA9IHRvdGFsVGltZTtcbiAgICB9XG4gIH0sXG4gICAgICBfZmluZE5leHRQYXVzZVR3ZWVuID0gZnVuY3Rpb24gX2ZpbmROZXh0UGF1c2VUd2VlbihhbmltYXRpb24sIHByZXZUaW1lLCB0aW1lKSB7XG4gICAgdmFyIGNoaWxkO1xuXG4gICAgaWYgKHRpbWUgPiBwcmV2VGltZSkge1xuICAgICAgY2hpbGQgPSBhbmltYXRpb24uX2ZpcnN0O1xuXG4gICAgICB3aGlsZSAoY2hpbGQgJiYgY2hpbGQuX3N0YXJ0IDw9IHRpbWUpIHtcbiAgICAgICAgaWYgKGNoaWxkLmRhdGEgPT09IFwiaXNQYXVzZVwiICYmIGNoaWxkLl9zdGFydCA+IHByZXZUaW1lKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQgPSBhbmltYXRpb24uX2xhc3Q7XG5cbiAgICAgIHdoaWxlIChjaGlsZCAmJiBjaGlsZC5fc3RhcnQgPj0gdGltZSkge1xuICAgICAgICBpZiAoY2hpbGQuZGF0YSA9PT0gXCJpc1BhdXNlXCIgJiYgY2hpbGQuX3N0YXJ0IDwgcHJldlRpbWUpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IGNoaWxkLl9wcmV2O1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgICAgIF9zZXREdXJhdGlvbiA9IGZ1bmN0aW9uIF9zZXREdXJhdGlvbihhbmltYXRpb24sIGR1cmF0aW9uLCBza2lwVW5jYWNoZSwgbGVhdmVQbGF5aGVhZCkge1xuICAgIHZhciByZXBlYXQgPSBhbmltYXRpb24uX3JlcGVhdCxcbiAgICAgICAgZHVyID0gX3JvdW5kUHJlY2lzZShkdXJhdGlvbikgfHwgMCxcbiAgICAgICAgdG90YWxQcm9ncmVzcyA9IGFuaW1hdGlvbi5fdFRpbWUgLyBhbmltYXRpb24uX3REdXI7XG4gICAgdG90YWxQcm9ncmVzcyAmJiAhbGVhdmVQbGF5aGVhZCAmJiAoYW5pbWF0aW9uLl90aW1lICo9IGR1ciAvIGFuaW1hdGlvbi5fZHVyKTtcbiAgICBhbmltYXRpb24uX2R1ciA9IGR1cjtcbiAgICBhbmltYXRpb24uX3REdXIgPSAhcmVwZWF0ID8gZHVyIDogcmVwZWF0IDwgMCA/IDFlMTAgOiBfcm91bmRQcmVjaXNlKGR1ciAqIChyZXBlYXQgKyAxKSArIGFuaW1hdGlvbi5fckRlbGF5ICogcmVwZWF0KTtcbiAgICB0b3RhbFByb2dyZXNzID4gMCAmJiAhbGVhdmVQbGF5aGVhZCA/IF9hbGlnblBsYXloZWFkKGFuaW1hdGlvbiwgYW5pbWF0aW9uLl90VGltZSA9IGFuaW1hdGlvbi5fdER1ciAqIHRvdGFsUHJvZ3Jlc3MpIDogYW5pbWF0aW9uLnBhcmVudCAmJiBfc2V0RW5kKGFuaW1hdGlvbik7XG4gICAgc2tpcFVuY2FjaGUgfHwgX3VuY2FjaGUoYW5pbWF0aW9uLnBhcmVudCwgYW5pbWF0aW9uKTtcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9LFxuICAgICAgX29uVXBkYXRlVG90YWxEdXJhdGlvbiA9IGZ1bmN0aW9uIF9vblVwZGF0ZVRvdGFsRHVyYXRpb24oYW5pbWF0aW9uKSB7XG4gICAgcmV0dXJuIGFuaW1hdGlvbiBpbnN0YW5jZW9mIFRpbWVsaW5lID8gX3VuY2FjaGUoYW5pbWF0aW9uKSA6IF9zZXREdXJhdGlvbihhbmltYXRpb24sIGFuaW1hdGlvbi5fZHVyKTtcbiAgfSxcbiAgICAgIF96ZXJvUG9zaXRpb24gPSB7XG4gICAgX3N0YXJ0OiAwLFxuICAgIGVuZFRpbWU6IF9lbXB0eUZ1bmMsXG4gICAgdG90YWxEdXJhdGlvbjogX2VtcHR5RnVuY1xuICB9LFxuICAgICAgX3BhcnNlUG9zaXRpb24gPSBmdW5jdGlvbiBfcGFyc2VQb3NpdGlvbihhbmltYXRpb24sIHBvc2l0aW9uLCBwZXJjZW50QW5pbWF0aW9uKSB7XG4gICAgdmFyIGxhYmVscyA9IGFuaW1hdGlvbi5sYWJlbHMsXG4gICAgICAgIHJlY2VudCA9IGFuaW1hdGlvbi5fcmVjZW50IHx8IF96ZXJvUG9zaXRpb24sXG4gICAgICAgIGNsaXBwZWREdXJhdGlvbiA9IGFuaW1hdGlvbi5kdXJhdGlvbigpID49IF9iaWdOdW0gPyByZWNlbnQuZW5kVGltZShmYWxzZSkgOiBhbmltYXRpb24uX2R1cixcbiAgICAgICAgaSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBpc1BlcmNlbnQ7XG5cbiAgICBpZiAoX2lzU3RyaW5nKHBvc2l0aW9uKSAmJiAoaXNOYU4ocG9zaXRpb24pIHx8IHBvc2l0aW9uIGluIGxhYmVscykpIHtcbiAgICAgIG9mZnNldCA9IHBvc2l0aW9uLmNoYXJBdCgwKTtcbiAgICAgIGlzUGVyY2VudCA9IHBvc2l0aW9uLnN1YnN0cigtMSkgPT09IFwiJVwiO1xuICAgICAgaSA9IHBvc2l0aW9uLmluZGV4T2YoXCI9XCIpO1xuXG4gICAgICBpZiAob2Zmc2V0ID09PSBcIjxcIiB8fCBvZmZzZXQgPT09IFwiPlwiKSB7XG4gICAgICAgIGkgPj0gMCAmJiAocG9zaXRpb24gPSBwb3NpdGlvbi5yZXBsYWNlKC89LywgXCJcIikpO1xuICAgICAgICByZXR1cm4gKG9mZnNldCA9PT0gXCI8XCIgPyByZWNlbnQuX3N0YXJ0IDogcmVjZW50LmVuZFRpbWUocmVjZW50Ll9yZXBlYXQgPj0gMCkpICsgKHBhcnNlRmxvYXQocG9zaXRpb24uc3Vic3RyKDEpKSB8fCAwKSAqIChpc1BlcmNlbnQgPyAoaSA8IDAgPyByZWNlbnQgOiBwZXJjZW50QW5pbWF0aW9uKS50b3RhbER1cmF0aW9uKCkgLyAxMDAgOiAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgIHBvc2l0aW9uIGluIGxhYmVscyB8fCAobGFiZWxzW3Bvc2l0aW9uXSA9IGNsaXBwZWREdXJhdGlvbik7XG4gICAgICAgIHJldHVybiBsYWJlbHNbcG9zaXRpb25dO1xuICAgICAgfVxuXG4gICAgICBvZmZzZXQgPSBwYXJzZUZsb2F0KHBvc2l0aW9uLmNoYXJBdChpIC0gMSkgKyBwb3NpdGlvbi5zdWJzdHIoaSArIDEpKTtcblxuICAgICAgaWYgKGlzUGVyY2VudCAmJiBwZXJjZW50QW5pbWF0aW9uKSB7XG4gICAgICAgIG9mZnNldCA9IG9mZnNldCAvIDEwMCAqIChfaXNBcnJheShwZXJjZW50QW5pbWF0aW9uKSA/IHBlcmNlbnRBbmltYXRpb25bMF0gOiBwZXJjZW50QW5pbWF0aW9uKS50b3RhbER1cmF0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpID4gMSA/IF9wYXJzZVBvc2l0aW9uKGFuaW1hdGlvbiwgcG9zaXRpb24uc3Vic3RyKDAsIGkgLSAxKSwgcGVyY2VudEFuaW1hdGlvbikgKyBvZmZzZXQgOiBjbGlwcGVkRHVyYXRpb24gKyBvZmZzZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uID09IG51bGwgPyBjbGlwcGVkRHVyYXRpb24gOiArcG9zaXRpb247XG4gIH0sXG4gICAgICBfY3JlYXRlVHdlZW5UeXBlID0gZnVuY3Rpb24gX2NyZWF0ZVR3ZWVuVHlwZSh0eXBlLCBwYXJhbXMsIHRpbWVsaW5lKSB7XG4gICAgdmFyIGlzTGVnYWN5ID0gX2lzTnVtYmVyKHBhcmFtc1sxXSksXG4gICAgICAgIHZhcnNJbmRleCA9IChpc0xlZ2FjeSA/IDIgOiAxKSArICh0eXBlIDwgMiA/IDAgOiAxKSxcbiAgICAgICAgdmFycyA9IHBhcmFtc1t2YXJzSW5kZXhdLFxuICAgICAgICBpclZhcnMsXG4gICAgICAgIHBhcmVudDtcblxuICAgIGlzTGVnYWN5ICYmICh2YXJzLmR1cmF0aW9uID0gcGFyYW1zWzFdKTtcbiAgICB2YXJzLnBhcmVudCA9IHRpbWVsaW5lO1xuXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGlyVmFycyA9IHZhcnM7XG4gICAgICBwYXJlbnQgPSB0aW1lbGluZTtcblxuICAgICAgd2hpbGUgKHBhcmVudCAmJiAhKFwiaW1tZWRpYXRlUmVuZGVyXCIgaW4gaXJWYXJzKSkge1xuICAgICAgICBpclZhcnMgPSBwYXJlbnQudmFycy5kZWZhdWx0cyB8fCB7fTtcbiAgICAgICAgcGFyZW50ID0gX2lzTm90RmFsc2UocGFyZW50LnZhcnMuaW5oZXJpdCkgJiYgcGFyZW50LnBhcmVudDtcbiAgICAgIH1cblxuICAgICAgdmFycy5pbW1lZGlhdGVSZW5kZXIgPSBfaXNOb3RGYWxzZShpclZhcnMuaW1tZWRpYXRlUmVuZGVyKTtcbiAgICAgIHR5cGUgPCAyID8gdmFycy5ydW5CYWNrd2FyZHMgPSAxIDogdmFycy5zdGFydEF0ID0gcGFyYW1zW3ZhcnNJbmRleCAtIDFdO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVHdlZW4ocGFyYW1zWzBdLCB2YXJzLCBwYXJhbXNbdmFyc0luZGV4ICsgMV0pO1xuICB9LFxuICAgICAgX2NvbmRpdGlvbmFsUmV0dXJuID0gZnVuY3Rpb24gX2NvbmRpdGlvbmFsUmV0dXJuKHZhbHVlLCBmdW5jKSB7XG4gICAgcmV0dXJuIHZhbHVlIHx8IHZhbHVlID09PSAwID8gZnVuYyh2YWx1ZSkgOiBmdW5jO1xuICB9LFxuICAgICAgX2NsYW1wID0gZnVuY3Rpb24gX2NsYW1wKG1pbiwgbWF4LCB2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWU7XG4gIH0sXG4gICAgICBnZXRVbml0ID0gZnVuY3Rpb24gZ2V0VW5pdCh2YWx1ZSwgdikge1xuICAgIHJldHVybiAhX2lzU3RyaW5nKHZhbHVlKSB8fCAhKHYgPSBfdW5pdEV4cC5leGVjKHZhbHVlKSkgPyBcIlwiIDogdmFsdWUuc3Vic3RyKHYuaW5kZXggKyB2WzBdLmxlbmd0aCk7XG4gIH0sXG4gICAgICBjbGFtcCA9IGZ1bmN0aW9uIGNsYW1wKG1pbiwgbWF4LCB2YWx1ZSkge1xuICAgIHJldHVybiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gX2NsYW1wKG1pbiwgbWF4LCB2KTtcbiAgICB9KTtcbiAgfSxcbiAgICAgIF9zbGljZSA9IFtdLnNsaWNlLFxuICAgICAgX2lzQXJyYXlMaWtlID0gZnVuY3Rpb24gX2lzQXJyYXlMaWtlKHZhbHVlLCBub25FbXB0eSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiBfaXNPYmplY3QodmFsdWUpICYmIFwibGVuZ3RoXCIgaW4gdmFsdWUgJiYgKCFub25FbXB0eSAmJiAhdmFsdWUubGVuZ3RoIHx8IHZhbHVlLmxlbmd0aCAtIDEgaW4gdmFsdWUgJiYgX2lzT2JqZWN0KHZhbHVlWzBdKSkgJiYgIXZhbHVlLm5vZGVUeXBlICYmIHZhbHVlICE9PSBfd2luO1xuICB9LFxuICAgICAgX2ZsYXR0ZW4gPSBmdW5jdGlvbiBfZmxhdHRlbihhciwgbGVhdmVTdHJpbmdzLCBhY2N1bXVsYXRvcikge1xuICAgIGlmIChhY2N1bXVsYXRvciA9PT0gdm9pZCAwKSB7XG4gICAgICBhY2N1bXVsYXRvciA9IFtdO1xuICAgIH1cblxuICAgIHJldHVybiBhci5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIF9hY2N1bXVsYXRvcjtcblxuICAgICAgcmV0dXJuIF9pc1N0cmluZyh2YWx1ZSkgJiYgIWxlYXZlU3RyaW5ncyB8fCBfaXNBcnJheUxpa2UodmFsdWUsIDEpID8gKF9hY2N1bXVsYXRvciA9IGFjY3VtdWxhdG9yKS5wdXNoLmFwcGx5KF9hY2N1bXVsYXRvciwgdG9BcnJheSh2YWx1ZSkpIDogYWNjdW11bGF0b3IucHVzaCh2YWx1ZSk7XG4gICAgfSkgfHwgYWNjdW11bGF0b3I7XG4gIH0sXG4gICAgICB0b0FycmF5ID0gZnVuY3Rpb24gdG9BcnJheSh2YWx1ZSwgc2NvcGUsIGxlYXZlU3RyaW5ncykge1xuICAgIHJldHVybiBfaXNTdHJpbmcodmFsdWUpICYmICFsZWF2ZVN0cmluZ3MgJiYgKF9jb3JlSW5pdHRlZCB8fCAhX3dha2UoKSkgPyBfc2xpY2UuY2FsbCgoc2NvcGUgfHwgX2RvYykucXVlcnlTZWxlY3RvckFsbCh2YWx1ZSksIDApIDogX2lzQXJyYXkodmFsdWUpID8gX2ZsYXR0ZW4odmFsdWUsIGxlYXZlU3RyaW5ncykgOiBfaXNBcnJheUxpa2UodmFsdWUpID8gX3NsaWNlLmNhbGwodmFsdWUsIDApIDogdmFsdWUgPyBbdmFsdWVdIDogW107XG4gIH0sXG4gICAgICBzZWxlY3RvciA9IGZ1bmN0aW9uIHNlbGVjdG9yKHZhbHVlKSB7XG4gICAgdmFsdWUgPSB0b0FycmF5KHZhbHVlKVswXSB8fCBfd2FybihcIkludmFsaWQgc2NvcGVcIikgfHwge307XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICB2YXIgZWwgPSB2YWx1ZS5jdXJyZW50IHx8IHZhbHVlLm5hdGl2ZUVsZW1lbnQgfHwgdmFsdWU7XG4gICAgICByZXR1cm4gdG9BcnJheSh2LCBlbC5xdWVyeVNlbGVjdG9yQWxsID8gZWwgOiBlbCA9PT0gdmFsdWUgPyBfd2FybihcIkludmFsaWQgc2NvcGVcIikgfHwgX2RvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpIDogdmFsdWUpO1xuICAgIH07XG4gIH0sXG4gICAgICBzaHVmZmxlID0gZnVuY3Rpb24gc2h1ZmZsZShhKSB7XG4gICAgcmV0dXJuIGEuc29ydChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gLjUgLSBNYXRoLnJhbmRvbSgpO1xuICAgIH0pO1xuICB9LFxuICAgICAgZGlzdHJpYnV0ZSA9IGZ1bmN0aW9uIGRpc3RyaWJ1dGUodikge1xuICAgIGlmIChfaXNGdW5jdGlvbih2KSkge1xuICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgdmFyIHZhcnMgPSBfaXNPYmplY3QodikgPyB2IDoge1xuICAgICAgZWFjaDogdlxuICAgIH0sXG4gICAgICAgIGVhc2UgPSBfcGFyc2VFYXNlKHZhcnMuZWFzZSksXG4gICAgICAgIGZyb20gPSB2YXJzLmZyb20gfHwgMCxcbiAgICAgICAgYmFzZSA9IHBhcnNlRmxvYXQodmFycy5iYXNlKSB8fCAwLFxuICAgICAgICBjYWNoZSA9IHt9LFxuICAgICAgICBpc0RlY2ltYWwgPSBmcm9tID4gMCAmJiBmcm9tIDwgMSxcbiAgICAgICAgcmF0aW9zID0gaXNOYU4oZnJvbSkgfHwgaXNEZWNpbWFsLFxuICAgICAgICBheGlzID0gdmFycy5heGlzLFxuICAgICAgICByYXRpb1ggPSBmcm9tLFxuICAgICAgICByYXRpb1kgPSBmcm9tO1xuXG4gICAgaWYgKF9pc1N0cmluZyhmcm9tKSkge1xuICAgICAgcmF0aW9YID0gcmF0aW9ZID0ge1xuICAgICAgICBjZW50ZXI6IC41LFxuICAgICAgICBlZGdlczogLjUsXG4gICAgICAgIGVuZDogMVxuICAgICAgfVtmcm9tXSB8fCAwO1xuICAgIH0gZWxzZSBpZiAoIWlzRGVjaW1hbCAmJiByYXRpb3MpIHtcbiAgICAgIHJhdGlvWCA9IGZyb21bMF07XG4gICAgICByYXRpb1kgPSBmcm9tWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoaSwgdGFyZ2V0LCBhKSB7XG4gICAgICB2YXIgbCA9IChhIHx8IHZhcnMpLmxlbmd0aCxcbiAgICAgICAgICBkaXN0YW5jZXMgPSBjYWNoZVtsXSxcbiAgICAgICAgICBvcmlnaW5YLFxuICAgICAgICAgIG9yaWdpblksXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIGQsXG4gICAgICAgICAgaixcbiAgICAgICAgICBtYXgsXG4gICAgICAgICAgbWluLFxuICAgICAgICAgIHdyYXBBdDtcblxuICAgICAgaWYgKCFkaXN0YW5jZXMpIHtcbiAgICAgICAgd3JhcEF0ID0gdmFycy5ncmlkID09PSBcImF1dG9cIiA/IDAgOiAodmFycy5ncmlkIHx8IFsxLCBfYmlnTnVtXSlbMV07XG5cbiAgICAgICAgaWYgKCF3cmFwQXQpIHtcbiAgICAgICAgICBtYXggPSAtX2JpZ051bTtcblxuICAgICAgICAgIHdoaWxlIChtYXggPCAobWF4ID0gYVt3cmFwQXQrK10uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCkgJiYgd3JhcEF0IDwgbCkge31cblxuICAgICAgICAgIHdyYXBBdC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzdGFuY2VzID0gY2FjaGVbbF0gPSBbXTtcbiAgICAgICAgb3JpZ2luWCA9IHJhdGlvcyA/IE1hdGgubWluKHdyYXBBdCwgbCkgKiByYXRpb1ggLSAuNSA6IGZyb20gJSB3cmFwQXQ7XG4gICAgICAgIG9yaWdpblkgPSB3cmFwQXQgPT09IF9iaWdOdW0gPyAwIDogcmF0aW9zID8gbCAqIHJhdGlvWSAvIHdyYXBBdCAtIC41IDogZnJvbSAvIHdyYXBBdCB8IDA7XG4gICAgICAgIG1heCA9IDA7XG4gICAgICAgIG1pbiA9IF9iaWdOdW07XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIHggPSBqICUgd3JhcEF0IC0gb3JpZ2luWDtcbiAgICAgICAgICB5ID0gb3JpZ2luWSAtIChqIC8gd3JhcEF0IHwgMCk7XG4gICAgICAgICAgZGlzdGFuY2VzW2pdID0gZCA9ICFheGlzID8gX3NxcnQoeCAqIHggKyB5ICogeSkgOiBNYXRoLmFicyhheGlzID09PSBcInlcIiA/IHkgOiB4KTtcbiAgICAgICAgICBkID4gbWF4ICYmIChtYXggPSBkKTtcbiAgICAgICAgICBkIDwgbWluICYmIChtaW4gPSBkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyb20gPT09IFwicmFuZG9tXCIgJiYgc2h1ZmZsZShkaXN0YW5jZXMpO1xuICAgICAgICBkaXN0YW5jZXMubWF4ID0gbWF4IC0gbWluO1xuICAgICAgICBkaXN0YW5jZXMubWluID0gbWluO1xuICAgICAgICBkaXN0YW5jZXMudiA9IGwgPSAocGFyc2VGbG9hdCh2YXJzLmFtb3VudCkgfHwgcGFyc2VGbG9hdCh2YXJzLmVhY2gpICogKHdyYXBBdCA+IGwgPyBsIC0gMSA6ICFheGlzID8gTWF0aC5tYXgod3JhcEF0LCBsIC8gd3JhcEF0KSA6IGF4aXMgPT09IFwieVwiID8gbCAvIHdyYXBBdCA6IHdyYXBBdCkgfHwgMCkgKiAoZnJvbSA9PT0gXCJlZGdlc1wiID8gLTEgOiAxKTtcbiAgICAgICAgZGlzdGFuY2VzLmIgPSBsIDwgMCA/IGJhc2UgLSBsIDogYmFzZTtcbiAgICAgICAgZGlzdGFuY2VzLnUgPSBnZXRVbml0KHZhcnMuYW1vdW50IHx8IHZhcnMuZWFjaCkgfHwgMDtcbiAgICAgICAgZWFzZSA9IGVhc2UgJiYgbCA8IDAgPyBfaW52ZXJ0RWFzZShlYXNlKSA6IGVhc2U7XG4gICAgICB9XG5cbiAgICAgIGwgPSAoZGlzdGFuY2VzW2ldIC0gZGlzdGFuY2VzLm1pbikgLyBkaXN0YW5jZXMubWF4IHx8IDA7XG4gICAgICByZXR1cm4gX3JvdW5kUHJlY2lzZShkaXN0YW5jZXMuYiArIChlYXNlID8gZWFzZShsKSA6IGwpICogZGlzdGFuY2VzLnYpICsgZGlzdGFuY2VzLnU7XG4gICAgfTtcbiAgfSxcbiAgICAgIF9yb3VuZE1vZGlmaWVyID0gZnVuY3Rpb24gX3JvdW5kTW9kaWZpZXIodikge1xuICAgIHZhciBwID0gTWF0aC5wb3coMTAsICgodiArIFwiXCIpLnNwbGl0KFwiLlwiKVsxXSB8fCBcIlwiKS5sZW5ndGgpO1xuICAgIHJldHVybiBmdW5jdGlvbiAocmF3KSB7XG4gICAgICB2YXIgbiA9IE1hdGgucm91bmQocGFyc2VGbG9hdChyYXcpIC8gdikgKiB2ICogcDtcbiAgICAgIHJldHVybiAobiAtIG4gJSAxKSAvIHAgKyAoX2lzTnVtYmVyKHJhdykgPyAwIDogZ2V0VW5pdChyYXcpKTtcbiAgICB9O1xuICB9LFxuICAgICAgc25hcCA9IGZ1bmN0aW9uIHNuYXAoc25hcFRvLCB2YWx1ZSkge1xuICAgIHZhciBpc0FycmF5ID0gX2lzQXJyYXkoc25hcFRvKSxcbiAgICAgICAgcmFkaXVzLFxuICAgICAgICBpczJEO1xuXG4gICAgaWYgKCFpc0FycmF5ICYmIF9pc09iamVjdChzbmFwVG8pKSB7XG4gICAgICByYWRpdXMgPSBpc0FycmF5ID0gc25hcFRvLnJhZGl1cyB8fCBfYmlnTnVtO1xuXG4gICAgICBpZiAoc25hcFRvLnZhbHVlcykge1xuICAgICAgICBzbmFwVG8gPSB0b0FycmF5KHNuYXBUby52YWx1ZXMpO1xuXG4gICAgICAgIGlmIChpczJEID0gIV9pc051bWJlcihzbmFwVG9bMF0pKSB7XG4gICAgICAgICAgcmFkaXVzICo9IHJhZGl1cztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc25hcFRvID0gX3JvdW5kTW9kaWZpZXIoc25hcFRvLmluY3JlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9jb25kaXRpb25hbFJldHVybih2YWx1ZSwgIWlzQXJyYXkgPyBfcm91bmRNb2RpZmllcihzbmFwVG8pIDogX2lzRnVuY3Rpb24oc25hcFRvKSA/IGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgIGlzMkQgPSBzbmFwVG8ocmF3KTtcbiAgICAgIHJldHVybiBNYXRoLmFicyhpczJEIC0gcmF3KSA8PSByYWRpdXMgPyBpczJEIDogcmF3O1xuICAgIH0gOiBmdW5jdGlvbiAocmF3KSB7XG4gICAgICB2YXIgeCA9IHBhcnNlRmxvYXQoaXMyRCA/IHJhdy54IDogcmF3KSxcbiAgICAgICAgICB5ID0gcGFyc2VGbG9hdChpczJEID8gcmF3LnkgOiAwKSxcbiAgICAgICAgICBtaW4gPSBfYmlnTnVtLFxuICAgICAgICAgIGNsb3Nlc3QgPSAwLFxuICAgICAgICAgIGkgPSBzbmFwVG8ubGVuZ3RoLFxuICAgICAgICAgIGR4LFxuICAgICAgICAgIGR5O1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmIChpczJEKSB7XG4gICAgICAgICAgZHggPSBzbmFwVG9baV0ueCAtIHg7XG4gICAgICAgICAgZHkgPSBzbmFwVG9baV0ueSAtIHk7XG4gICAgICAgICAgZHggPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeCA9IE1hdGguYWJzKHNuYXBUb1tpXSAtIHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR4IDwgbWluKSB7XG4gICAgICAgICAgbWluID0gZHg7XG4gICAgICAgICAgY2xvc2VzdCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2xvc2VzdCA9ICFyYWRpdXMgfHwgbWluIDw9IHJhZGl1cyA/IHNuYXBUb1tjbG9zZXN0XSA6IHJhdztcbiAgICAgIHJldHVybiBpczJEIHx8IGNsb3Nlc3QgPT09IHJhdyB8fCBfaXNOdW1iZXIocmF3KSA/IGNsb3Nlc3QgOiBjbG9zZXN0ICsgZ2V0VW5pdChyYXcpO1xuICAgIH0pO1xuICB9LFxuICAgICAgcmFuZG9tID0gZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4LCByb3VuZGluZ0luY3JlbWVudCwgcmV0dXJuRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gX2NvbmRpdGlvbmFsUmV0dXJuKF9pc0FycmF5KG1pbikgPyAhbWF4IDogcm91bmRpbmdJbmNyZW1lbnQgPT09IHRydWUgPyAhIShyb3VuZGluZ0luY3JlbWVudCA9IDApIDogIXJldHVybkZ1bmN0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX2lzQXJyYXkobWluKSA/IG1pblt+fihNYXRoLnJhbmRvbSgpICogbWluLmxlbmd0aCldIDogKHJvdW5kaW5nSW5jcmVtZW50ID0gcm91bmRpbmdJbmNyZW1lbnQgfHwgMWUtNSkgJiYgKHJldHVybkZ1bmN0aW9uID0gcm91bmRpbmdJbmNyZW1lbnQgPCAxID8gTWF0aC5wb3coMTAsIChyb3VuZGluZ0luY3JlbWVudCArIFwiXCIpLmxlbmd0aCAtIDIpIDogMSkgJiYgTWF0aC5mbG9vcihNYXRoLnJvdW5kKChtaW4gLSByb3VuZGluZ0luY3JlbWVudCAvIDIgKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIHJvdW5kaW5nSW5jcmVtZW50ICogLjk5KSkgLyByb3VuZGluZ0luY3JlbWVudCkgKiByb3VuZGluZ0luY3JlbWVudCAqIHJldHVybkZ1bmN0aW9uKSAvIHJldHVybkZ1bmN0aW9uO1xuICAgIH0pO1xuICB9LFxuICAgICAgcGlwZSA9IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmN0aW9ucyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGZ1bmN0aW9uc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb25zLnJlZHVjZShmdW5jdGlvbiAodiwgZikge1xuICAgICAgICByZXR1cm4gZih2KTtcbiAgICAgIH0sIHZhbHVlKTtcbiAgICB9O1xuICB9LFxuICAgICAgdW5pdGl6ZSA9IGZ1bmN0aW9uIHVuaXRpemUoZnVuYywgdW5pdCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jKHBhcnNlRmxvYXQodmFsdWUpKSArICh1bml0IHx8IGdldFVuaXQodmFsdWUpKTtcbiAgICB9O1xuICB9LFxuICAgICAgbm9ybWFsaXplID0gZnVuY3Rpb24gbm9ybWFsaXplKG1pbiwgbWF4LCB2YWx1ZSkge1xuICAgIHJldHVybiBtYXBSYW5nZShtaW4sIG1heCwgMCwgMSwgdmFsdWUpO1xuICB9LFxuICAgICAgX3dyYXBBcnJheSA9IGZ1bmN0aW9uIF93cmFwQXJyYXkoYSwgd3JhcHBlciwgdmFsdWUpIHtcbiAgICByZXR1cm4gX2NvbmRpdGlvbmFsUmV0dXJuKHZhbHVlLCBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHJldHVybiBhW35+d3JhcHBlcihpbmRleCldO1xuICAgIH0pO1xuICB9LFxuICAgICAgd3JhcCA9IGZ1bmN0aW9uIHdyYXAobWluLCBtYXgsIHZhbHVlKSB7XG4gICAgdmFyIHJhbmdlID0gbWF4IC0gbWluO1xuICAgIHJldHVybiBfaXNBcnJheShtaW4pID8gX3dyYXBBcnJheShtaW4sIHdyYXAoMCwgbWluLmxlbmd0aCksIG1heCkgOiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIChyYW5nZSArICh2YWx1ZSAtIG1pbikgJSByYW5nZSkgJSByYW5nZSArIG1pbjtcbiAgICB9KTtcbiAgfSxcbiAgICAgIHdyYXBZb3lvID0gZnVuY3Rpb24gd3JhcFlveW8obWluLCBtYXgsIHZhbHVlKSB7XG4gICAgdmFyIHJhbmdlID0gbWF4IC0gbWluLFxuICAgICAgICB0b3RhbCA9IHJhbmdlICogMjtcbiAgICByZXR1cm4gX2lzQXJyYXkobWluKSA/IF93cmFwQXJyYXkobWluLCB3cmFwWW95bygwLCBtaW4ubGVuZ3RoIC0gMSksIG1heCkgOiBfY29uZGl0aW9uYWxSZXR1cm4odmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAodG90YWwgKyAodmFsdWUgLSBtaW4pICUgdG90YWwpICUgdG90YWwgfHwgMDtcbiAgICAgIHJldHVybiBtaW4gKyAodmFsdWUgPiByYW5nZSA/IHRvdGFsIC0gdmFsdWUgOiB2YWx1ZSk7XG4gICAgfSk7XG4gIH0sXG4gICAgICBfcmVwbGFjZVJhbmRvbSA9IGZ1bmN0aW9uIF9yZXBsYWNlUmFuZG9tKHZhbHVlKSB7XG4gICAgdmFyIHByZXYgPSAwLFxuICAgICAgICBzID0gXCJcIixcbiAgICAgICAgaSxcbiAgICAgICAgbnVtcyxcbiAgICAgICAgZW5kLFxuICAgICAgICBpc0FycmF5O1xuXG4gICAgd2hpbGUgKH4oaSA9IHZhbHVlLmluZGV4T2YoXCJyYW5kb20oXCIsIHByZXYpKSkge1xuICAgICAgZW5kID0gdmFsdWUuaW5kZXhPZihcIilcIiwgaSk7XG4gICAgICBpc0FycmF5ID0gdmFsdWUuY2hhckF0KGkgKyA3KSA9PT0gXCJbXCI7XG4gICAgICBudW1zID0gdmFsdWUuc3Vic3RyKGkgKyA3LCBlbmQgLSBpIC0gNykubWF0Y2goaXNBcnJheSA/IF9kZWxpbWl0ZWRWYWx1ZUV4cCA6IF9zdHJpY3ROdW1FeHApO1xuICAgICAgcyArPSB2YWx1ZS5zdWJzdHIocHJldiwgaSAtIHByZXYpICsgcmFuZG9tKGlzQXJyYXkgPyBudW1zIDogK251bXNbMF0sIGlzQXJyYXkgPyAwIDogK251bXNbMV0sICtudW1zWzJdIHx8IDFlLTUpO1xuICAgICAgcHJldiA9IGVuZCArIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHMgKyB2YWx1ZS5zdWJzdHIocHJldiwgdmFsdWUubGVuZ3RoIC0gcHJldik7XG4gIH0sXG4gICAgICBtYXBSYW5nZSA9IGZ1bmN0aW9uIG1hcFJhbmdlKGluTWluLCBpbk1heCwgb3V0TWluLCBvdXRNYXgsIHZhbHVlKSB7XG4gICAgdmFyIGluUmFuZ2UgPSBpbk1heCAtIGluTWluLFxuICAgICAgICBvdXRSYW5nZSA9IG91dE1heCAtIG91dE1pbjtcbiAgICByZXR1cm4gX2NvbmRpdGlvbmFsUmV0dXJuKHZhbHVlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBvdXRNaW4gKyAoKHZhbHVlIC0gaW5NaW4pIC8gaW5SYW5nZSAqIG91dFJhbmdlIHx8IDApO1xuICAgIH0pO1xuICB9LFxuICAgICAgaW50ZXJwb2xhdGUgPSBmdW5jdGlvbiBpbnRlcnBvbGF0ZShzdGFydCwgZW5kLCBwcm9ncmVzcywgbXV0YXRlKSB7XG4gICAgdmFyIGZ1bmMgPSBpc05hTihzdGFydCArIGVuZCkgPyAwIDogZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAoMSAtIHApICogc3RhcnQgKyBwICogZW5kO1xuICAgIH07XG5cbiAgICBpZiAoIWZ1bmMpIHtcbiAgICAgIHZhciBpc1N0cmluZyA9IF9pc1N0cmluZyhzdGFydCksXG4gICAgICAgICAgbWFzdGVyID0ge30sXG4gICAgICAgICAgcCxcbiAgICAgICAgICBpLFxuICAgICAgICAgIGludGVycG9sYXRvcnMsXG4gICAgICAgICAgbCxcbiAgICAgICAgICBpbDtcblxuICAgICAgcHJvZ3Jlc3MgPT09IHRydWUgJiYgKG11dGF0ZSA9IDEpICYmIChwcm9ncmVzcyA9IG51bGwpO1xuXG4gICAgICBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgc3RhcnQgPSB7XG4gICAgICAgICAgcDogc3RhcnRcbiAgICAgICAgfTtcbiAgICAgICAgZW5kID0ge1xuICAgICAgICAgIHA6IGVuZFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfaXNBcnJheShzdGFydCkgJiYgIV9pc0FycmF5KGVuZCkpIHtcbiAgICAgICAgaW50ZXJwb2xhdG9ycyA9IFtdO1xuICAgICAgICBsID0gc3RhcnQubGVuZ3RoO1xuICAgICAgICBpbCA9IGwgLSAyO1xuXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpbnRlcnBvbGF0b3JzLnB1c2goaW50ZXJwb2xhdGUoc3RhcnRbaSAtIDFdLCBzdGFydFtpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbC0tO1xuXG4gICAgICAgIGZ1bmMgPSBmdW5jdGlvbiBmdW5jKHApIHtcbiAgICAgICAgICBwICo9IGw7XG4gICAgICAgICAgdmFyIGkgPSBNYXRoLm1pbihpbCwgfn5wKTtcbiAgICAgICAgICByZXR1cm4gaW50ZXJwb2xhdG9yc1tpXShwIC0gaSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJvZ3Jlc3MgPSBlbmQ7XG4gICAgICB9IGVsc2UgaWYgKCFtdXRhdGUpIHtcbiAgICAgICAgc3RhcnQgPSBfbWVyZ2UoX2lzQXJyYXkoc3RhcnQpID8gW10gOiB7fSwgc3RhcnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWludGVycG9sYXRvcnMpIHtcbiAgICAgICAgZm9yIChwIGluIGVuZCkge1xuICAgICAgICAgIF9hZGRQcm9wVHdlZW4uY2FsbChtYXN0ZXIsIHN0YXJ0LCBwLCBcImdldFwiLCBlbmRbcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuYyA9IGZ1bmN0aW9uIGZ1bmMocCkge1xuICAgICAgICAgIHJldHVybiBfcmVuZGVyUHJvcFR3ZWVucyhwLCBtYXN0ZXIpIHx8IChpc1N0cmluZyA/IHN0YXJ0LnAgOiBzdGFydCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9jb25kaXRpb25hbFJldHVybihwcm9ncmVzcywgZnVuYyk7XG4gIH0sXG4gICAgICBfZ2V0TGFiZWxJbkRpcmVjdGlvbiA9IGZ1bmN0aW9uIF9nZXRMYWJlbEluRGlyZWN0aW9uKHRpbWVsaW5lLCBmcm9tVGltZSwgYmFja3dhcmQpIHtcbiAgICB2YXIgbGFiZWxzID0gdGltZWxpbmUubGFiZWxzLFxuICAgICAgICBtaW4gPSBfYmlnTnVtLFxuICAgICAgICBwLFxuICAgICAgICBkaXN0YW5jZSxcbiAgICAgICAgbGFiZWw7XG5cbiAgICBmb3IgKHAgaW4gbGFiZWxzKSB7XG4gICAgICBkaXN0YW5jZSA9IGxhYmVsc1twXSAtIGZyb21UaW1lO1xuXG4gICAgICBpZiAoZGlzdGFuY2UgPCAwID09PSAhIWJhY2t3YXJkICYmIGRpc3RhbmNlICYmIG1pbiA+IChkaXN0YW5jZSA9IE1hdGguYWJzKGRpc3RhbmNlKSkpIHtcbiAgICAgICAgbGFiZWwgPSBwO1xuICAgICAgICBtaW4gPSBkaXN0YW5jZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWw7XG4gIH0sXG4gICAgICBfY2FsbGJhY2sgPSBmdW5jdGlvbiBfY2FsbGJhY2soYW5pbWF0aW9uLCB0eXBlLCBleGVjdXRlTGF6eUZpcnN0KSB7XG4gICAgdmFyIHYgPSBhbmltYXRpb24udmFycyxcbiAgICAgICAgY2FsbGJhY2sgPSB2W3R5cGVdLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHNjb3BlO1xuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBhcmFtcyA9IHZbdHlwZSArIFwiUGFyYW1zXCJdO1xuICAgIHNjb3BlID0gdi5jYWxsYmFja1Njb3BlIHx8IGFuaW1hdGlvbjtcbiAgICBleGVjdXRlTGF6eUZpcnN0ICYmIF9sYXp5VHdlZW5zLmxlbmd0aCAmJiBfbGF6eVJlbmRlcigpO1xuICAgIHJldHVybiBwYXJhbXMgPyBjYWxsYmFjay5hcHBseShzY29wZSwgcGFyYW1zKSA6IGNhbGxiYWNrLmNhbGwoc2NvcGUpO1xuICB9LFxuICAgICAgX2ludGVycnVwdCA9IGZ1bmN0aW9uIF9pbnRlcnJ1cHQoYW5pbWF0aW9uKSB7XG4gICAgX3JlbW92ZUZyb21QYXJlbnQoYW5pbWF0aW9uKTtcblxuICAgIGFuaW1hdGlvbi5zY3JvbGxUcmlnZ2VyICYmIGFuaW1hdGlvbi5zY3JvbGxUcmlnZ2VyLmtpbGwoZmFsc2UpO1xuICAgIGFuaW1hdGlvbi5wcm9ncmVzcygpIDwgMSAmJiBfY2FsbGJhY2soYW5pbWF0aW9uLCBcIm9uSW50ZXJydXB0XCIpO1xuICAgIHJldHVybiBhbmltYXRpb247XG4gIH0sXG4gICAgICBfcXVpY2tUd2VlbixcbiAgICAgIF9jcmVhdGVQbHVnaW4gPSBmdW5jdGlvbiBfY3JlYXRlUGx1Z2luKGNvbmZpZykge1xuICAgIGNvbmZpZyA9ICFjb25maWcubmFtZSAmJiBjb25maWdbXCJkZWZhdWx0XCJdIHx8IGNvbmZpZztcblxuICAgIHZhciBuYW1lID0gY29uZmlnLm5hbWUsXG4gICAgICAgIGlzRnVuYyA9IF9pc0Z1bmN0aW9uKGNvbmZpZyksXG4gICAgICAgIFBsdWdpbiA9IG5hbWUgJiYgIWlzRnVuYyAmJiBjb25maWcuaW5pdCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX3Byb3BzID0gW107XG4gICAgfSA6IGNvbmZpZyxcbiAgICAgICAgaW5zdGFuY2VEZWZhdWx0cyA9IHtcbiAgICAgIGluaXQ6IF9lbXB0eUZ1bmMsXG4gICAgICByZW5kZXI6IF9yZW5kZXJQcm9wVHdlZW5zLFxuICAgICAgYWRkOiBfYWRkUHJvcFR3ZWVuLFxuICAgICAga2lsbDogX2tpbGxQcm9wVHdlZW5zT2YsXG4gICAgICBtb2RpZmllcjogX2FkZFBsdWdpbk1vZGlmaWVyLFxuICAgICAgcmF3VmFyczogMFxuICAgIH0sXG4gICAgICAgIHN0YXRpY3MgPSB7XG4gICAgICB0YXJnZXRUZXN0OiAwLFxuICAgICAgZ2V0OiAwLFxuICAgICAgZ2V0U2V0dGVyOiBfZ2V0U2V0dGVyLFxuICAgICAgYWxpYXNlczoge30sXG4gICAgICByZWdpc3RlcjogMFxuICAgIH07XG5cbiAgICBfd2FrZSgpO1xuXG4gICAgaWYgKGNvbmZpZyAhPT0gUGx1Z2luKSB7XG4gICAgICBpZiAoX3BsdWdpbnNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfc2V0RGVmYXVsdHMoUGx1Z2luLCBfc2V0RGVmYXVsdHMoX2NvcHlFeGNsdWRpbmcoY29uZmlnLCBpbnN0YW5jZURlZmF1bHRzKSwgc3RhdGljcykpO1xuXG4gICAgICBfbWVyZ2UoUGx1Z2luLnByb3RvdHlwZSwgX21lcmdlKGluc3RhbmNlRGVmYXVsdHMsIF9jb3B5RXhjbHVkaW5nKGNvbmZpZywgc3RhdGljcykpKTtcblxuICAgICAgX3BsdWdpbnNbUGx1Z2luLnByb3AgPSBuYW1lXSA9IFBsdWdpbjtcblxuICAgICAgaWYgKGNvbmZpZy50YXJnZXRUZXN0KSB7XG4gICAgICAgIF9oYXJuZXNzUGx1Z2lucy5wdXNoKFBsdWdpbik7XG5cbiAgICAgICAgX3Jlc2VydmVkUHJvcHNbbmFtZV0gPSAxO1xuICAgICAgfVxuXG4gICAgICBuYW1lID0gKG5hbWUgPT09IFwiY3NzXCIgPyBcIkNTU1wiIDogbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyKDEpKSArIFwiUGx1Z2luXCI7XG4gICAgfVxuXG4gICAgX2FkZEdsb2JhbChuYW1lLCBQbHVnaW4pO1xuXG4gICAgY29uZmlnLnJlZ2lzdGVyICYmIGNvbmZpZy5yZWdpc3Rlcihnc2FwLCBQbHVnaW4sIFByb3BUd2Vlbik7XG4gIH0sXG4gICAgICBfMjU1ID0gMjU1LFxuICAgICAgX2NvbG9yTG9va3VwID0ge1xuICAgIGFxdWE6IFswLCBfMjU1LCBfMjU1XSxcbiAgICBsaW1lOiBbMCwgXzI1NSwgMF0sXG4gICAgc2lsdmVyOiBbMTkyLCAxOTIsIDE5Ml0sXG4gICAgYmxhY2s6IFswLCAwLCAwXSxcbiAgICBtYXJvb246IFsxMjgsIDAsIDBdLFxuICAgIHRlYWw6IFswLCAxMjgsIDEyOF0sXG4gICAgYmx1ZTogWzAsIDAsIF8yNTVdLFxuICAgIG5hdnk6IFswLCAwLCAxMjhdLFxuICAgIHdoaXRlOiBbXzI1NSwgXzI1NSwgXzI1NV0sXG4gICAgb2xpdmU6IFsxMjgsIDEyOCwgMF0sXG4gICAgeWVsbG93OiBbXzI1NSwgXzI1NSwgMF0sXG4gICAgb3JhbmdlOiBbXzI1NSwgMTY1LCAwXSxcbiAgICBncmF5OiBbMTI4LCAxMjgsIDEyOF0sXG4gICAgcHVycGxlOiBbMTI4LCAwLCAxMjhdLFxuICAgIGdyZWVuOiBbMCwgMTI4LCAwXSxcbiAgICByZWQ6IFtfMjU1LCAwLCAwXSxcbiAgICBwaW5rOiBbXzI1NSwgMTkyLCAyMDNdLFxuICAgIGN5YW46IFswLCBfMjU1LCBfMjU1XSxcbiAgICB0cmFuc3BhcmVudDogW18yNTUsIF8yNTUsIF8yNTUsIDBdXG4gIH0sXG4gICAgICBfaHVlID0gZnVuY3Rpb24gX2h1ZShoLCBtMSwgbTIpIHtcbiAgICBoICs9IGggPCAwID8gMSA6IGggPiAxID8gLTEgOiAwO1xuICAgIHJldHVybiAoaCAqIDYgPCAxID8gbTEgKyAobTIgLSBtMSkgKiBoICogNiA6IGggPCAuNSA/IG0yIDogaCAqIDMgPCAyID8gbTEgKyAobTIgLSBtMSkgKiAoMiAvIDMgLSBoKSAqIDYgOiBtMSkgKiBfMjU1ICsgLjUgfCAwO1xuICB9LFxuICAgICAgc3BsaXRDb2xvciA9IGZ1bmN0aW9uIHNwbGl0Q29sb3IodiwgdG9IU0wsIGZvcmNlQWxwaGEpIHtcbiAgICB2YXIgYSA9ICF2ID8gX2NvbG9yTG9va3VwLmJsYWNrIDogX2lzTnVtYmVyKHYpID8gW3YgPj4gMTYsIHYgPj4gOCAmIF8yNTUsIHYgJiBfMjU1XSA6IDAsXG4gICAgICAgIHIsXG4gICAgICAgIGcsXG4gICAgICAgIGIsXG4gICAgICAgIGgsXG4gICAgICAgIHMsXG4gICAgICAgIGwsXG4gICAgICAgIG1heCxcbiAgICAgICAgbWluLFxuICAgICAgICBkLFxuICAgICAgICB3YXNIU0w7XG5cbiAgICBpZiAoIWEpIHtcbiAgICAgIGlmICh2LnN1YnN0cigtMSkgPT09IFwiLFwiKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cigwLCB2Lmxlbmd0aCAtIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2NvbG9yTG9va3VwW3ZdKSB7XG4gICAgICAgIGEgPSBfY29sb3JMb29rdXBbdl07XG4gICAgICB9IGVsc2UgaWYgKHYuY2hhckF0KDApID09PSBcIiNcIikge1xuICAgICAgICBpZiAodi5sZW5ndGggPCA2KSB7XG4gICAgICAgICAgciA9IHYuY2hhckF0KDEpO1xuICAgICAgICAgIGcgPSB2LmNoYXJBdCgyKTtcbiAgICAgICAgICBiID0gdi5jaGFyQXQoMyk7XG4gICAgICAgICAgdiA9IFwiI1wiICsgciArIHIgKyBnICsgZyArIGIgKyBiICsgKHYubGVuZ3RoID09PSA1ID8gdi5jaGFyQXQoNCkgKyB2LmNoYXJBdCg0KSA6IFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgYSA9IHBhcnNlSW50KHYuc3Vic3RyKDEsIDYpLCAxNik7XG4gICAgICAgICAgcmV0dXJuIFthID4+IDE2LCBhID4+IDggJiBfMjU1LCBhICYgXzI1NSwgcGFyc2VJbnQodi5zdWJzdHIoNyksIDE2KSAvIDI1NV07XG4gICAgICAgIH1cblxuICAgICAgICB2ID0gcGFyc2VJbnQodi5zdWJzdHIoMSksIDE2KTtcbiAgICAgICAgYSA9IFt2ID4+IDE2LCB2ID4+IDggJiBfMjU1LCB2ICYgXzI1NV07XG4gICAgICB9IGVsc2UgaWYgKHYuc3Vic3RyKDAsIDMpID09PSBcImhzbFwiKSB7XG4gICAgICAgIGEgPSB3YXNIU0wgPSB2Lm1hdGNoKF9zdHJpY3ROdW1FeHApO1xuXG4gICAgICAgIGlmICghdG9IU0wpIHtcbiAgICAgICAgICBoID0gK2FbMF0gJSAzNjAgLyAzNjA7XG4gICAgICAgICAgcyA9ICthWzFdIC8gMTAwO1xuICAgICAgICAgIGwgPSArYVsyXSAvIDEwMDtcbiAgICAgICAgICBnID0gbCA8PSAuNSA/IGwgKiAocyArIDEpIDogbCArIHMgLSBsICogcztcbiAgICAgICAgICByID0gbCAqIDIgLSBnO1xuICAgICAgICAgIGEubGVuZ3RoID4gMyAmJiAoYVszXSAqPSAxKTtcbiAgICAgICAgICBhWzBdID0gX2h1ZShoICsgMSAvIDMsIHIsIGcpO1xuICAgICAgICAgIGFbMV0gPSBfaHVlKGgsIHIsIGcpO1xuICAgICAgICAgIGFbMl0gPSBfaHVlKGggLSAxIC8gMywgciwgZyk7XG4gICAgICAgIH0gZWxzZSBpZiAofnYuaW5kZXhPZihcIj1cIikpIHtcbiAgICAgICAgICBhID0gdi5tYXRjaChfbnVtRXhwKTtcbiAgICAgICAgICBmb3JjZUFscGhhICYmIGEubGVuZ3RoIDwgNCAmJiAoYVszXSA9IDEpO1xuICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhID0gdi5tYXRjaChfc3RyaWN0TnVtRXhwKSB8fCBfY29sb3JMb29rdXAudHJhbnNwYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGEgPSBhLm1hcChOdW1iZXIpO1xuICAgIH1cblxuICAgIGlmICh0b0hTTCAmJiAhd2FzSFNMKSB7XG4gICAgICByID0gYVswXSAvIF8yNTU7XG4gICAgICBnID0gYVsxXSAvIF8yNTU7XG4gICAgICBiID0gYVsyXSAvIF8yNTU7XG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcblxuICAgICAgaWYgKG1heCA9PT0gbWluKSB7XG4gICAgICAgIGggPSBzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGQgPSBtYXggLSBtaW47XG4gICAgICAgIHMgPSBsID4gMC41ID8gZCAvICgyIC0gbWF4IC0gbWluKSA6IGQgLyAobWF4ICsgbWluKTtcbiAgICAgICAgaCA9IG1heCA9PT0gciA/IChnIC0gYikgLyBkICsgKGcgPCBiID8gNiA6IDApIDogbWF4ID09PSBnID8gKGIgLSByKSAvIGQgKyAyIDogKHIgLSBnKSAvIGQgKyA0O1xuICAgICAgICBoICo9IDYwO1xuICAgICAgfVxuXG4gICAgICBhWzBdID0gfn4oaCArIC41KTtcbiAgICAgIGFbMV0gPSB+fihzICogMTAwICsgLjUpO1xuICAgICAgYVsyXSA9IH5+KGwgKiAxMDAgKyAuNSk7XG4gICAgfVxuXG4gICAgZm9yY2VBbHBoYSAmJiBhLmxlbmd0aCA8IDQgJiYgKGFbM10gPSAxKTtcbiAgICByZXR1cm4gYTtcbiAgfSxcbiAgICAgIF9jb2xvck9yZGVyRGF0YSA9IGZ1bmN0aW9uIF9jb2xvck9yZGVyRGF0YSh2KSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdLFxuICAgICAgICBjID0gW10sXG4gICAgICAgIGkgPSAtMTtcbiAgICB2LnNwbGl0KF9jb2xvckV4cCkuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgdmFyIGEgPSB2Lm1hdGNoKF9udW1XaXRoVW5pdEV4cCkgfHwgW107XG4gICAgICB2YWx1ZXMucHVzaC5hcHBseSh2YWx1ZXMsIGEpO1xuICAgICAgYy5wdXNoKGkgKz0gYS5sZW5ndGggKyAxKTtcbiAgICB9KTtcbiAgICB2YWx1ZXMuYyA9IGM7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSxcbiAgICAgIF9mb3JtYXRDb2xvcnMgPSBmdW5jdGlvbiBfZm9ybWF0Q29sb3JzKHMsIHRvSFNMLCBvcmRlck1hdGNoRGF0YSkge1xuICAgIHZhciByZXN1bHQgPSBcIlwiLFxuICAgICAgICBjb2xvcnMgPSAocyArIHJlc3VsdCkubWF0Y2goX2NvbG9yRXhwKSxcbiAgICAgICAgdHlwZSA9IHRvSFNMID8gXCJoc2xhKFwiIDogXCJyZ2JhKFwiLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgYyxcbiAgICAgICAgc2hlbGwsXG4gICAgICAgIGQsXG4gICAgICAgIGw7XG5cbiAgICBpZiAoIWNvbG9ycykge1xuICAgICAgcmV0dXJuIHM7XG4gICAgfVxuXG4gICAgY29sb3JzID0gY29sb3JzLm1hcChmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgIHJldHVybiAoY29sb3IgPSBzcGxpdENvbG9yKGNvbG9yLCB0b0hTTCwgMSkpICYmIHR5cGUgKyAodG9IU0wgPyBjb2xvclswXSArIFwiLFwiICsgY29sb3JbMV0gKyBcIiUsXCIgKyBjb2xvclsyXSArIFwiJSxcIiArIGNvbG9yWzNdIDogY29sb3Iuam9pbihcIixcIikpICsgXCIpXCI7XG4gICAgfSk7XG5cbiAgICBpZiAob3JkZXJNYXRjaERhdGEpIHtcbiAgICAgIGQgPSBfY29sb3JPcmRlckRhdGEocyk7XG4gICAgICBjID0gb3JkZXJNYXRjaERhdGEuYztcblxuICAgICAgaWYgKGMuam9pbihyZXN1bHQpICE9PSBkLmMuam9pbihyZXN1bHQpKSB7XG4gICAgICAgIHNoZWxsID0gcy5yZXBsYWNlKF9jb2xvckV4cCwgXCIxXCIpLnNwbGl0KF9udW1XaXRoVW5pdEV4cCk7XG4gICAgICAgIGwgPSBzaGVsbC5sZW5ndGggLSAxO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IHNoZWxsW2ldICsgKH5jLmluZGV4T2YoaSkgPyBjb2xvcnMuc2hpZnQoKSB8fCB0eXBlICsgXCIwLDAsMCwwKVwiIDogKGQubGVuZ3RoID8gZCA6IGNvbG9ycy5sZW5ndGggPyBjb2xvcnMgOiBvcmRlck1hdGNoRGF0YSkuc2hpZnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNoZWxsKSB7XG4gICAgICBzaGVsbCA9IHMuc3BsaXQoX2NvbG9yRXhwKTtcbiAgICAgIGwgPSBzaGVsbC5sZW5ndGggLSAxO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gc2hlbGxbaV0gKyBjb2xvcnNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdCArIHNoZWxsW2xdO1xuICB9LFxuICAgICAgX2NvbG9yRXhwID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzID0gXCIoPzpcXFxcYig/Oig/OnJnYnxyZ2JhfGhzbHxoc2xhKVxcXFwoLis/XFxcXCkpfFxcXFxCIyg/OlswLTlhLWZdezMsNH0pezEsMn1cXFxcYlwiLFxuICAgICAgICBwO1xuXG4gICAgZm9yIChwIGluIF9jb2xvckxvb2t1cCkge1xuICAgICAgcyArPSBcInxcIiArIHAgKyBcIlxcXFxiXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocyArIFwiKVwiLCBcImdpXCIpO1xuICB9KCksXG4gICAgICBfaHNsRXhwID0gL2hzbFthXT9cXCgvLFxuICAgICAgX2NvbG9yU3RyaW5nRmlsdGVyID0gZnVuY3Rpb24gX2NvbG9yU3RyaW5nRmlsdGVyKGEpIHtcbiAgICB2YXIgY29tYmluZWQgPSBhLmpvaW4oXCIgXCIpLFxuICAgICAgICB0b0hTTDtcbiAgICBfY29sb3JFeHAubGFzdEluZGV4ID0gMDtcblxuICAgIGlmIChfY29sb3JFeHAudGVzdChjb21iaW5lZCkpIHtcbiAgICAgIHRvSFNMID0gX2hzbEV4cC50ZXN0KGNvbWJpbmVkKTtcbiAgICAgIGFbMV0gPSBfZm9ybWF0Q29sb3JzKGFbMV0sIHRvSFNMKTtcbiAgICAgIGFbMF0gPSBfZm9ybWF0Q29sb3JzKGFbMF0sIHRvSFNMLCBfY29sb3JPcmRlckRhdGEoYVsxXSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LFxuICAgICAgX3RpY2tlckFjdGl2ZSxcbiAgICAgIF90aWNrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9nZXRUaW1lID0gRGF0ZS5ub3csXG4gICAgICAgIF9sYWdUaHJlc2hvbGQgPSA1MDAsXG4gICAgICAgIF9hZGp1c3RlZExhZyA9IDMzLFxuICAgICAgICBfc3RhcnRUaW1lID0gX2dldFRpbWUoKSxcbiAgICAgICAgX2xhc3RVcGRhdGUgPSBfc3RhcnRUaW1lLFxuICAgICAgICBfZ2FwID0gMTAwMCAvIDI0MCxcbiAgICAgICAgX25leHRUaW1lID0gX2dhcCxcbiAgICAgICAgX2xpc3RlbmVycyA9IFtdLFxuICAgICAgICBfaWQsXG4gICAgICAgIF9yZXEsXG4gICAgICAgIF9yYWYsXG4gICAgICAgIF9zZWxmLFxuICAgICAgICBfZGVsdGEsXG4gICAgICAgIF9pLFxuICAgICAgICBfdGljayA9IGZ1bmN0aW9uIF90aWNrKHYpIHtcbiAgICAgIHZhciBlbGFwc2VkID0gX2dldFRpbWUoKSAtIF9sYXN0VXBkYXRlLFxuICAgICAgICAgIG1hbnVhbCA9IHYgPT09IHRydWUsXG4gICAgICAgICAgb3ZlcmxhcCxcbiAgICAgICAgICBkaXNwYXRjaCxcbiAgICAgICAgICB0aW1lLFxuICAgICAgICAgIGZyYW1lO1xuXG4gICAgICBlbGFwc2VkID4gX2xhZ1RocmVzaG9sZCAmJiAoX3N0YXJ0VGltZSArPSBlbGFwc2VkIC0gX2FkanVzdGVkTGFnKTtcbiAgICAgIF9sYXN0VXBkYXRlICs9IGVsYXBzZWQ7XG4gICAgICB0aW1lID0gX2xhc3RVcGRhdGUgLSBfc3RhcnRUaW1lO1xuICAgICAgb3ZlcmxhcCA9IHRpbWUgLSBfbmV4dFRpbWU7XG5cbiAgICAgIGlmIChvdmVybGFwID4gMCB8fCBtYW51YWwpIHtcbiAgICAgICAgZnJhbWUgPSArK19zZWxmLmZyYW1lO1xuICAgICAgICBfZGVsdGEgPSB0aW1lIC0gX3NlbGYudGltZSAqIDEwMDA7XG4gICAgICAgIF9zZWxmLnRpbWUgPSB0aW1lID0gdGltZSAvIDEwMDA7XG4gICAgICAgIF9uZXh0VGltZSArPSBvdmVybGFwICsgKG92ZXJsYXAgPj0gX2dhcCA/IDQgOiBfZ2FwIC0gb3ZlcmxhcCk7XG4gICAgICAgIGRpc3BhdGNoID0gMTtcbiAgICAgIH1cblxuICAgICAgbWFudWFsIHx8IChfaWQgPSBfcmVxKF90aWNrKSk7XG5cbiAgICAgIGlmIChkaXNwYXRjaCkge1xuICAgICAgICBmb3IgKF9pID0gMDsgX2kgPCBfbGlzdGVuZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgIF9saXN0ZW5lcnNbX2ldKHRpbWUsIF9kZWx0YSwgZnJhbWUsIHYpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmID0ge1xuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgdGljazogZnVuY3Rpb24gdGljaygpIHtcbiAgICAgICAgX3RpY2sodHJ1ZSk7XG4gICAgICB9LFxuICAgICAgZGVsdGFSYXRpbzogZnVuY3Rpb24gZGVsdGFSYXRpbyhmcHMpIHtcbiAgICAgICAgcmV0dXJuIF9kZWx0YSAvICgxMDAwIC8gKGZwcyB8fCA2MCkpO1xuICAgICAgfSxcbiAgICAgIHdha2U6IGZ1bmN0aW9uIHdha2UoKSB7XG4gICAgICAgIGlmIChfY29yZVJlYWR5KSB7XG4gICAgICAgICAgaWYgKCFfY29yZUluaXR0ZWQgJiYgX3dpbmRvd0V4aXN0cygpKSB7XG4gICAgICAgICAgICBfd2luID0gX2NvcmVJbml0dGVkID0gd2luZG93O1xuICAgICAgICAgICAgX2RvYyA9IF93aW4uZG9jdW1lbnQgfHwge307XG4gICAgICAgICAgICBfZ2xvYmFscy5nc2FwID0gZ3NhcDtcbiAgICAgICAgICAgIChfd2luLmdzYXBWZXJzaW9ucyB8fCAoX3dpbi5nc2FwVmVyc2lvbnMgPSBbXSkpLnB1c2goZ3NhcC52ZXJzaW9uKTtcblxuICAgICAgICAgICAgX2luc3RhbGwoX2luc3RhbGxTY29wZSB8fCBfd2luLkdyZWVuU29ja0dsb2JhbHMgfHwgIV93aW4uZ3NhcCAmJiBfd2luIHx8IHt9KTtcblxuICAgICAgICAgICAgX3JhZiA9IF93aW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF9pZCAmJiBfc2VsZi5zbGVlcCgpO1xuXG4gICAgICAgICAgX3JlcSA9IF9yYWYgfHwgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGYsIF9uZXh0VGltZSAtIF9zZWxmLnRpbWUgKiAxMDAwICsgMSB8IDApO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBfdGlja2VyQWN0aXZlID0gMTtcblxuICAgICAgICAgIF90aWNrKDIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2xlZXA6IGZ1bmN0aW9uIHNsZWVwKCkge1xuICAgICAgICAoX3JhZiA/IF93aW4uY2FuY2VsQW5pbWF0aW9uRnJhbWUgOiBjbGVhclRpbWVvdXQpKF9pZCk7XG4gICAgICAgIF90aWNrZXJBY3RpdmUgPSAwO1xuICAgICAgICBfcmVxID0gX2VtcHR5RnVuYztcbiAgICAgIH0sXG4gICAgICBsYWdTbW9vdGhpbmc6IGZ1bmN0aW9uIGxhZ1Ntb290aGluZyh0aHJlc2hvbGQsIGFkanVzdGVkTGFnKSB7XG4gICAgICAgIF9sYWdUaHJlc2hvbGQgPSB0aHJlc2hvbGQgfHwgMSAvIF90aW55TnVtO1xuICAgICAgICBfYWRqdXN0ZWRMYWcgPSBNYXRoLm1pbihhZGp1c3RlZExhZywgX2xhZ1RocmVzaG9sZCwgMCk7XG4gICAgICB9LFxuICAgICAgZnBzOiBmdW5jdGlvbiBmcHMoX2Zwcykge1xuICAgICAgICBfZ2FwID0gMTAwMCAvIChfZnBzIHx8IDI0MCk7XG4gICAgICAgIF9uZXh0VGltZSA9IF9zZWxmLnRpbWUgKiAxMDAwICsgX2dhcDtcbiAgICAgIH0sXG4gICAgICBhZGQ6IGZ1bmN0aW9uIGFkZChjYWxsYmFjaykge1xuICAgICAgICBfbGlzdGVuZXJzLmluZGV4T2YoY2FsbGJhY2spIDwgMCAmJiBfbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuXG4gICAgICAgIF93YWtlKCk7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoY2FsbGJhY2ssIGkpIHtcbiAgICAgICAgfihpID0gX2xpc3RlbmVycy5pbmRleE9mKGNhbGxiYWNrKSkgJiYgX2xpc3RlbmVycy5zcGxpY2UoaSwgMSkgJiYgX2kgPj0gaSAmJiBfaS0tO1xuICAgICAgfSxcbiAgICAgIF9saXN0ZW5lcnM6IF9saXN0ZW5lcnNcbiAgICB9O1xuICAgIHJldHVybiBfc2VsZjtcbiAgfSgpLFxuICAgICAgX3dha2UgPSBmdW5jdGlvbiBfd2FrZSgpIHtcbiAgICByZXR1cm4gIV90aWNrZXJBY3RpdmUgJiYgX3RpY2tlci53YWtlKCk7XG4gIH0sXG4gICAgICBfZWFzZU1hcCA9IHt9LFxuICAgICAgX2N1c3RvbUVhc2VFeHAgPSAvXltcXGQuXFwtTV1bXFxkLlxcLSxcXHNdLyxcbiAgICAgIF9xdW90ZXNFeHAgPSAvW1wiJ10vZyxcbiAgICAgIF9wYXJzZU9iamVjdEluU3RyaW5nID0gZnVuY3Rpb24gX3BhcnNlT2JqZWN0SW5TdHJpbmcodmFsdWUpIHtcbiAgICB2YXIgb2JqID0ge30sXG4gICAgICAgIHNwbGl0ID0gdmFsdWUuc3Vic3RyKDEsIHZhbHVlLmxlbmd0aCAtIDMpLnNwbGl0KFwiOlwiKSxcbiAgICAgICAga2V5ID0gc3BsaXRbMF0sXG4gICAgICAgIGkgPSAxLFxuICAgICAgICBsID0gc3BsaXQubGVuZ3RoLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgdmFsLFxuICAgICAgICBwYXJzZWRWYWw7XG5cbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFsID0gc3BsaXRbaV07XG4gICAgICBpbmRleCA9IGkgIT09IGwgLSAxID8gdmFsLmxhc3RJbmRleE9mKFwiLFwiKSA6IHZhbC5sZW5ndGg7XG4gICAgICBwYXJzZWRWYWwgPSB2YWwuc3Vic3RyKDAsIGluZGV4KTtcbiAgICAgIG9ialtrZXldID0gaXNOYU4ocGFyc2VkVmFsKSA/IHBhcnNlZFZhbC5yZXBsYWNlKF9xdW90ZXNFeHAsIFwiXCIpLnRyaW0oKSA6ICtwYXJzZWRWYWw7XG4gICAgICBrZXkgPSB2YWwuc3Vic3RyKGluZGV4ICsgMSkudHJpbSgpO1xuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gICAgICBfdmFsdWVJblBhcmVudGhlc2VzID0gZnVuY3Rpb24gX3ZhbHVlSW5QYXJlbnRoZXNlcyh2YWx1ZSkge1xuICAgIHZhciBvcGVuID0gdmFsdWUuaW5kZXhPZihcIihcIikgKyAxLFxuICAgICAgICBjbG9zZSA9IHZhbHVlLmluZGV4T2YoXCIpXCIpLFxuICAgICAgICBuZXN0ZWQgPSB2YWx1ZS5pbmRleE9mKFwiKFwiLCBvcGVuKTtcbiAgICByZXR1cm4gdmFsdWUuc3Vic3RyaW5nKG9wZW4sIH5uZXN0ZWQgJiYgbmVzdGVkIDwgY2xvc2UgPyB2YWx1ZS5pbmRleE9mKFwiKVwiLCBjbG9zZSArIDEpIDogY2xvc2UpO1xuICB9LFxuICAgICAgX2NvbmZpZ0Vhc2VGcm9tU3RyaW5nID0gZnVuY3Rpb24gX2NvbmZpZ0Vhc2VGcm9tU3RyaW5nKG5hbWUpIHtcbiAgICB2YXIgc3BsaXQgPSAobmFtZSArIFwiXCIpLnNwbGl0KFwiKFwiKSxcbiAgICAgICAgZWFzZSA9IF9lYXNlTWFwW3NwbGl0WzBdXTtcbiAgICByZXR1cm4gZWFzZSAmJiBzcGxpdC5sZW5ndGggPiAxICYmIGVhc2UuY29uZmlnID8gZWFzZS5jb25maWcuYXBwbHkobnVsbCwgfm5hbWUuaW5kZXhPZihcIntcIikgPyBbX3BhcnNlT2JqZWN0SW5TdHJpbmcoc3BsaXRbMV0pXSA6IF92YWx1ZUluUGFyZW50aGVzZXMobmFtZSkuc3BsaXQoXCIsXCIpLm1hcChfbnVtZXJpY0lmUG9zc2libGUpKSA6IF9lYXNlTWFwLl9DRSAmJiBfY3VzdG9tRWFzZUV4cC50ZXN0KG5hbWUpID8gX2Vhc2VNYXAuX0NFKFwiXCIsIG5hbWUpIDogZWFzZTtcbiAgfSxcbiAgICAgIF9pbnZlcnRFYXNlID0gZnVuY3Rpb24gX2ludmVydEVhc2UoZWFzZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIDEgLSBlYXNlKDEgLSBwKTtcbiAgICB9O1xuICB9LFxuICAgICAgX3Byb3BhZ2F0ZVlveW9FYXNlID0gZnVuY3Rpb24gX3Byb3BhZ2F0ZVlveW9FYXNlKHRpbWVsaW5lLCBpc1lveW8pIHtcbiAgICB2YXIgY2hpbGQgPSB0aW1lbGluZS5fZmlyc3QsXG4gICAgICAgIGVhc2U7XG5cbiAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRpbWVsaW5lKSB7XG4gICAgICAgIF9wcm9wYWdhdGVZb3lvRWFzZShjaGlsZCwgaXNZb3lvKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hpbGQudmFycy55b3lvRWFzZSAmJiAoIWNoaWxkLl95b3lvIHx8ICFjaGlsZC5fcmVwZWF0KSAmJiBjaGlsZC5feW95byAhPT0gaXNZb3lvKSB7XG4gICAgICAgIGlmIChjaGlsZC50aW1lbGluZSkge1xuICAgICAgICAgIF9wcm9wYWdhdGVZb3lvRWFzZShjaGlsZC50aW1lbGluZSwgaXNZb3lvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlYXNlID0gY2hpbGQuX2Vhc2U7XG4gICAgICAgICAgY2hpbGQuX2Vhc2UgPSBjaGlsZC5feUVhc2U7XG4gICAgICAgICAgY2hpbGQuX3lFYXNlID0gZWFzZTtcbiAgICAgICAgICBjaGlsZC5feW95byA9IGlzWW95bztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjaGlsZCA9IGNoaWxkLl9uZXh0O1xuICAgIH1cbiAgfSxcbiAgICAgIF9wYXJzZUVhc2UgPSBmdW5jdGlvbiBfcGFyc2VFYXNlKGVhc2UsIGRlZmF1bHRFYXNlKSB7XG4gICAgcmV0dXJuICFlYXNlID8gZGVmYXVsdEVhc2UgOiAoX2lzRnVuY3Rpb24oZWFzZSkgPyBlYXNlIDogX2Vhc2VNYXBbZWFzZV0gfHwgX2NvbmZpZ0Vhc2VGcm9tU3RyaW5nKGVhc2UpKSB8fCBkZWZhdWx0RWFzZTtcbiAgfSxcbiAgICAgIF9pbnNlcnRFYXNlID0gZnVuY3Rpb24gX2luc2VydEVhc2UobmFtZXMsIGVhc2VJbiwgZWFzZU91dCwgZWFzZUluT3V0KSB7XG4gICAgaWYgKGVhc2VPdXQgPT09IHZvaWQgMCkge1xuICAgICAgZWFzZU91dCA9IGZ1bmN0aW9uIGVhc2VPdXQocCkge1xuICAgICAgICByZXR1cm4gMSAtIGVhc2VJbigxIC0gcCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChlYXNlSW5PdXQgPT09IHZvaWQgMCkge1xuICAgICAgZWFzZUluT3V0ID0gZnVuY3Rpb24gZWFzZUluT3V0KHApIHtcbiAgICAgICAgcmV0dXJuIHAgPCAuNSA/IGVhc2VJbihwICogMikgLyAyIDogMSAtIGVhc2VJbigoMSAtIHApICogMikgLyAyO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgZWFzZSA9IHtcbiAgICAgIGVhc2VJbjogZWFzZUluLFxuICAgICAgZWFzZU91dDogZWFzZU91dCxcbiAgICAgIGVhc2VJbk91dDogZWFzZUluT3V0XG4gICAgfSxcbiAgICAgICAgbG93ZXJjYXNlTmFtZTtcblxuICAgIF9mb3JFYWNoTmFtZShuYW1lcywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIF9lYXNlTWFwW25hbWVdID0gX2dsb2JhbHNbbmFtZV0gPSBlYXNlO1xuICAgICAgX2Vhc2VNYXBbbG93ZXJjYXNlTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKV0gPSBlYXNlT3V0O1xuXG4gICAgICBmb3IgKHZhciBwIGluIGVhc2UpIHtcbiAgICAgICAgX2Vhc2VNYXBbbG93ZXJjYXNlTmFtZSArIChwID09PSBcImVhc2VJblwiID8gXCIuaW5cIiA6IHAgPT09IFwiZWFzZU91dFwiID8gXCIub3V0XCIgOiBcIi5pbk91dFwiKV0gPSBfZWFzZU1hcFtuYW1lICsgXCIuXCIgKyBwXSA9IGVhc2VbcF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZWFzZTtcbiAgfSxcbiAgICAgIF9lYXNlSW5PdXRGcm9tT3V0ID0gZnVuY3Rpb24gX2Vhc2VJbk91dEZyb21PdXQoZWFzZU91dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIHAgPCAuNSA/ICgxIC0gZWFzZU91dCgxIC0gcCAqIDIpKSAvIDIgOiAuNSArIGVhc2VPdXQoKHAgLSAuNSkgKiAyKSAvIDI7XG4gICAgfTtcbiAgfSxcbiAgICAgIF9jb25maWdFbGFzdGljID0gZnVuY3Rpb24gX2NvbmZpZ0VsYXN0aWModHlwZSwgYW1wbGl0dWRlLCBwZXJpb2QpIHtcbiAgICB2YXIgcDEgPSBhbXBsaXR1ZGUgPj0gMSA/IGFtcGxpdHVkZSA6IDEsXG4gICAgICAgIHAyID0gKHBlcmlvZCB8fCAodHlwZSA/IC4zIDogLjQ1KSkgLyAoYW1wbGl0dWRlIDwgMSA/IGFtcGxpdHVkZSA6IDEpLFxuICAgICAgICBwMyA9IHAyIC8gXzJQSSAqIChNYXRoLmFzaW4oMSAvIHAxKSB8fCAwKSxcbiAgICAgICAgZWFzZU91dCA9IGZ1bmN0aW9uIGVhc2VPdXQocCkge1xuICAgICAgcmV0dXJuIHAgPT09IDEgPyAxIDogcDEgKiBNYXRoLnBvdygyLCAtMTAgKiBwKSAqIF9zaW4oKHAgLSBwMykgKiBwMikgKyAxO1xuICAgIH0sXG4gICAgICAgIGVhc2UgPSB0eXBlID09PSBcIm91dFwiID8gZWFzZU91dCA6IHR5cGUgPT09IFwiaW5cIiA/IGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gMSAtIGVhc2VPdXQoMSAtIHApO1xuICAgIH0gOiBfZWFzZUluT3V0RnJvbU91dChlYXNlT3V0KTtcblxuICAgIHAyID0gXzJQSSAvIHAyO1xuXG4gICAgZWFzZS5jb25maWcgPSBmdW5jdGlvbiAoYW1wbGl0dWRlLCBwZXJpb2QpIHtcbiAgICAgIHJldHVybiBfY29uZmlnRWxhc3RpYyh0eXBlLCBhbXBsaXR1ZGUsIHBlcmlvZCk7XG4gICAgfTtcblxuICAgIHJldHVybiBlYXNlO1xuICB9LFxuICAgICAgX2NvbmZpZ0JhY2sgPSBmdW5jdGlvbiBfY29uZmlnQmFjayh0eXBlLCBvdmVyc2hvb3QpIHtcbiAgICBpZiAob3ZlcnNob290ID09PSB2b2lkIDApIHtcbiAgICAgIG92ZXJzaG9vdCA9IDEuNzAxNTg7XG4gICAgfVxuXG4gICAgdmFyIGVhc2VPdXQgPSBmdW5jdGlvbiBlYXNlT3V0KHApIHtcbiAgICAgIHJldHVybiBwID8gLS1wICogcCAqICgob3ZlcnNob290ICsgMSkgKiBwICsgb3ZlcnNob290KSArIDEgOiAwO1xuICAgIH0sXG4gICAgICAgIGVhc2UgPSB0eXBlID09PSBcIm91dFwiID8gZWFzZU91dCA6IHR5cGUgPT09IFwiaW5cIiA/IGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gMSAtIGVhc2VPdXQoMSAtIHApO1xuICAgIH0gOiBfZWFzZUluT3V0RnJvbU91dChlYXNlT3V0KTtcblxuICAgIGVhc2UuY29uZmlnID0gZnVuY3Rpb24gKG92ZXJzaG9vdCkge1xuICAgICAgcmV0dXJuIF9jb25maWdCYWNrKHR5cGUsIG92ZXJzaG9vdCk7XG4gICAgfTtcblxuICAgIHJldHVybiBlYXNlO1xuICB9O1xuXG4gIF9mb3JFYWNoTmFtZShcIkxpbmVhcixRdWFkLEN1YmljLFF1YXJ0LFF1aW50LFN0cm9uZ1wiLCBmdW5jdGlvbiAobmFtZSwgaSkge1xuICAgIHZhciBwb3dlciA9IGkgPCA1ID8gaSArIDEgOiBpO1xuXG4gICAgX2luc2VydEVhc2UobmFtZSArIFwiLFBvd2VyXCIgKyAocG93ZXIgLSAxKSwgaSA/IGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gTWF0aC5wb3cocCwgcG93ZXIpO1xuICAgIH0gOiBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIHA7XG4gICAgfSwgZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAxIC0gTWF0aC5wb3coMSAtIHAsIHBvd2VyKTtcbiAgICB9LCBmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIHAgPCAuNSA/IE1hdGgucG93KHAgKiAyLCBwb3dlcikgLyAyIDogMSAtIE1hdGgucG93KCgxIC0gcCkgKiAyLCBwb3dlcikgLyAyO1xuICAgIH0pO1xuICB9KTtcblxuICBfZWFzZU1hcC5MaW5lYXIuZWFzZU5vbmUgPSBfZWFzZU1hcC5ub25lID0gX2Vhc2VNYXAuTGluZWFyLmVhc2VJbjtcblxuICBfaW5zZXJ0RWFzZShcIkVsYXN0aWNcIiwgX2NvbmZpZ0VsYXN0aWMoXCJpblwiKSwgX2NvbmZpZ0VsYXN0aWMoXCJvdXRcIiksIF9jb25maWdFbGFzdGljKCkpO1xuXG4gIChmdW5jdGlvbiAobiwgYykge1xuICAgIHZhciBuMSA9IDEgLyBjLFxuICAgICAgICBuMiA9IDIgKiBuMSxcbiAgICAgICAgbjMgPSAyLjUgKiBuMSxcbiAgICAgICAgZWFzZU91dCA9IGZ1bmN0aW9uIGVhc2VPdXQocCkge1xuICAgICAgcmV0dXJuIHAgPCBuMSA/IG4gKiBwICogcCA6IHAgPCBuMiA/IG4gKiBNYXRoLnBvdyhwIC0gMS41IC8gYywgMikgKyAuNzUgOiBwIDwgbjMgPyBuICogKHAgLT0gMi4yNSAvIGMpICogcCArIC45Mzc1IDogbiAqIE1hdGgucG93KHAgLSAyLjYyNSAvIGMsIDIpICsgLjk4NDM3NTtcbiAgICB9O1xuXG4gICAgX2luc2VydEVhc2UoXCJCb3VuY2VcIiwgZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAxIC0gZWFzZU91dCgxIC0gcCk7XG4gICAgfSwgZWFzZU91dCk7XG4gIH0pKDcuNTYyNSwgMi43NSk7XG5cbiAgX2luc2VydEVhc2UoXCJFeHBvXCIsIGZ1bmN0aW9uIChwKSB7XG4gICAgcmV0dXJuIHAgPyBNYXRoLnBvdygyLCAxMCAqIChwIC0gMSkpIDogMDtcbiAgfSk7XG5cbiAgX2luc2VydEVhc2UoXCJDaXJjXCIsIGZ1bmN0aW9uIChwKSB7XG4gICAgcmV0dXJuIC0oX3NxcnQoMSAtIHAgKiBwKSAtIDEpO1xuICB9KTtcblxuICBfaW5zZXJ0RWFzZShcIlNpbmVcIiwgZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcCA9PT0gMSA/IDEgOiAtX2NvcyhwICogX0hBTEZfUEkpICsgMTtcbiAgfSk7XG5cbiAgX2luc2VydEVhc2UoXCJCYWNrXCIsIF9jb25maWdCYWNrKFwiaW5cIiksIF9jb25maWdCYWNrKFwib3V0XCIpLCBfY29uZmlnQmFjaygpKTtcblxuICBfZWFzZU1hcC5TdGVwcGVkRWFzZSA9IF9lYXNlTWFwLnN0ZXBzID0gX2dsb2JhbHMuU3RlcHBlZEVhc2UgPSB7XG4gICAgY29uZmlnOiBmdW5jdGlvbiBjb25maWcoc3RlcHMsIGltbWVkaWF0ZVN0YXJ0KSB7XG4gICAgICBpZiAoc3RlcHMgPT09IHZvaWQgMCkge1xuICAgICAgICBzdGVwcyA9IDE7XG4gICAgICB9XG5cbiAgICAgIHZhciBwMSA9IDEgLyBzdGVwcyxcbiAgICAgICAgICBwMiA9IHN0ZXBzICsgKGltbWVkaWF0ZVN0YXJ0ID8gMCA6IDEpLFxuICAgICAgICAgIHAzID0gaW1tZWRpYXRlU3RhcnQgPyAxIDogMCxcbiAgICAgICAgICBtYXggPSAxIC0gX3RpbnlOdW07XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuICgocDIgKiBfY2xhbXAoMCwgbWF4LCBwKSB8IDApICsgcDMpICogcDE7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgX2RlZmF1bHRzLmVhc2UgPSBfZWFzZU1hcFtcInF1YWQub3V0XCJdO1xuXG4gIF9mb3JFYWNoTmFtZShcIm9uQ29tcGxldGUsb25VcGRhdGUsb25TdGFydCxvblJlcGVhdCxvblJldmVyc2VDb21wbGV0ZSxvbkludGVycnVwdFwiLCBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBfY2FsbGJhY2tOYW1lcyArPSBuYW1lICsgXCIsXCIgKyBuYW1lICsgXCJQYXJhbXMsXCI7XG4gIH0pO1xuXG4gIHZhciBHU0NhY2hlID0gZnVuY3Rpb24gR1NDYWNoZSh0YXJnZXQsIGhhcm5lc3MpIHtcbiAgICB0aGlzLmlkID0gX2dzSUQrKztcbiAgICB0YXJnZXQuX2dzYXAgPSB0aGlzO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuaGFybmVzcyA9IGhhcm5lc3M7XG4gICAgdGhpcy5nZXQgPSBoYXJuZXNzID8gaGFybmVzcy5nZXQgOiBfZ2V0UHJvcGVydHk7XG4gICAgdGhpcy5zZXQgPSBoYXJuZXNzID8gaGFybmVzcy5nZXRTZXR0ZXIgOiBfZ2V0U2V0dGVyO1xuICB9O1xuICB2YXIgQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFuaW1hdGlvbih2YXJzKSB7XG4gICAgICB0aGlzLnZhcnMgPSB2YXJzO1xuICAgICAgdGhpcy5fZGVsYXkgPSArdmFycy5kZWxheSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5fcmVwZWF0ID0gdmFycy5yZXBlYXQgPT09IEluZmluaXR5ID8gLTIgOiB2YXJzLnJlcGVhdCB8fCAwKSB7XG4gICAgICAgIHRoaXMuX3JEZWxheSA9IHZhcnMucmVwZWF0RGVsYXkgfHwgMDtcbiAgICAgICAgdGhpcy5feW95byA9ICEhdmFycy55b3lvIHx8ICEhdmFycy55b3lvRWFzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdHMgPSAxO1xuXG4gICAgICBfc2V0RHVyYXRpb24odGhpcywgK3ZhcnMuZHVyYXRpb24sIDEsIDEpO1xuXG4gICAgICB0aGlzLmRhdGEgPSB2YXJzLmRhdGE7XG4gICAgICBfdGlja2VyQWN0aXZlIHx8IF90aWNrZXIud2FrZSgpO1xuICAgIH1cblxuICAgIHZhciBfcHJvdG8gPSBBbmltYXRpb24ucHJvdG90eXBlO1xuXG4gICAgX3Byb3RvLmRlbGF5ID0gZnVuY3Rpb24gZGVsYXkodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSB8fCB2YWx1ZSA9PT0gMCkge1xuICAgICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5zbW9vdGhDaGlsZFRpbWluZyAmJiB0aGlzLnN0YXJ0VGltZSh0aGlzLl9zdGFydCArIHZhbHVlIC0gdGhpcy5fZGVsYXkpO1xuICAgICAgICB0aGlzLl9kZWxheSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2RlbGF5O1xuICAgIH07XG5cbiAgICBfcHJvdG8uZHVyYXRpb24gPSBmdW5jdGlvbiBkdXJhdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRvdGFsRHVyYXRpb24odGhpcy5fcmVwZWF0ID4gMCA/IHZhbHVlICsgKHZhbHVlICsgdGhpcy5fckRlbGF5KSAqIHRoaXMuX3JlcGVhdCA6IHZhbHVlKSA6IHRoaXMudG90YWxEdXJhdGlvbigpICYmIHRoaXMuX2R1cjtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRvdGFsRHVyYXRpb24gPSBmdW5jdGlvbiB0b3RhbER1cmF0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3REdXI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2RpcnR5ID0gMDtcbiAgICAgIHJldHVybiBfc2V0RHVyYXRpb24odGhpcywgdGhpcy5fcmVwZWF0IDwgMCA/IHZhbHVlIDogKHZhbHVlIC0gdGhpcy5fcmVwZWF0ICogdGhpcy5fckRlbGF5KSAvICh0aGlzLl9yZXBlYXQgKyAxKSk7XG4gICAgfTtcblxuICAgIF9wcm90by50b3RhbFRpbWUgPSBmdW5jdGlvbiB0b3RhbFRpbWUoX3RvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIF93YWtlKCk7XG5cbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdFRpbWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzLl9kcDtcblxuICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQuc21vb3RoQ2hpbGRUaW1pbmcgJiYgdGhpcy5fdHMpIHtcbiAgICAgICAgX2FsaWduUGxheWhlYWQodGhpcywgX3RvdGFsVGltZSk7XG5cbiAgICAgICAgIXBhcmVudC5fZHAgfHwgcGFyZW50LnBhcmVudCB8fCBfcG9zdEFkZENoZWNrcyhwYXJlbnQsIHRoaXMpO1xuXG4gICAgICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50LnBhcmVudCkge1xuICAgICAgICAgIGlmIChwYXJlbnQucGFyZW50Ll90aW1lICE9PSBwYXJlbnQuX3N0YXJ0ICsgKHBhcmVudC5fdHMgPj0gMCA/IHBhcmVudC5fdFRpbWUgLyBwYXJlbnQuX3RzIDogKHBhcmVudC50b3RhbER1cmF0aW9uKCkgLSBwYXJlbnQuX3RUaW1lKSAvIC1wYXJlbnQuX3RzKSkge1xuICAgICAgICAgICAgcGFyZW50LnRvdGFsVGltZShwYXJlbnQuX3RUaW1lLCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudCAmJiB0aGlzLl9kcC5hdXRvUmVtb3ZlQ2hpbGRyZW4gJiYgKHRoaXMuX3RzID4gMCAmJiBfdG90YWxUaW1lIDwgdGhpcy5fdER1ciB8fCB0aGlzLl90cyA8IDAgJiYgX3RvdGFsVGltZSA+IDAgfHwgIXRoaXMuX3REdXIgJiYgIV90b3RhbFRpbWUpKSB7XG4gICAgICAgICAgX2FkZFRvVGltZWxpbmUodGhpcy5fZHAsIHRoaXMsIHRoaXMuX3N0YXJ0IC0gdGhpcy5fZGVsYXkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl90VGltZSAhPT0gX3RvdGFsVGltZSB8fCAhdGhpcy5fZHVyICYmICFzdXBwcmVzc0V2ZW50cyB8fCB0aGlzLl9pbml0dGVkICYmIE1hdGguYWJzKHRoaXMuX3pUaW1lKSA9PT0gX3RpbnlOdW0gfHwgIV90b3RhbFRpbWUgJiYgIXRoaXMuX2luaXR0ZWQgJiYgKHRoaXMuYWRkIHx8IHRoaXMuX3B0TG9va3VwKSkge1xuICAgICAgICB0aGlzLl90cyB8fCAodGhpcy5fcFRpbWUgPSBfdG90YWxUaW1lKTtcblxuICAgICAgICBfbGF6eVNhZmVSZW5kZXIodGhpcywgX3RvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvLnRpbWUgPSBmdW5jdGlvbiB0aW1lKHZhbHVlLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRvdGFsVGltZShNYXRoLm1pbih0aGlzLnRvdGFsRHVyYXRpb24oKSwgdmFsdWUgKyBfZWxhcHNlZEN5Y2xlRHVyYXRpb24odGhpcykpICUgKHRoaXMuX2R1ciArIHRoaXMuX3JEZWxheSkgfHwgKHZhbHVlID8gdGhpcy5fZHVyIDogMCksIHN1cHByZXNzRXZlbnRzKSA6IHRoaXMuX3RpbWU7XG4gICAgfTtcblxuICAgIF9wcm90by50b3RhbFByb2dyZXNzID0gZnVuY3Rpb24gdG90YWxQcm9ncmVzcyh2YWx1ZSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy50b3RhbFRpbWUodGhpcy50b3RhbER1cmF0aW9uKCkgKiB2YWx1ZSwgc3VwcHJlc3NFdmVudHMpIDogdGhpcy50b3RhbER1cmF0aW9uKCkgPyBNYXRoLm1pbigxLCB0aGlzLl90VGltZSAvIHRoaXMuX3REdXIpIDogdGhpcy5yYXRpbztcbiAgICB9O1xuXG4gICAgX3Byb3RvLnByb2dyZXNzID0gZnVuY3Rpb24gcHJvZ3Jlc3ModmFsdWUsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMudG90YWxUaW1lKHRoaXMuZHVyYXRpb24oKSAqICh0aGlzLl95b3lvICYmICEodGhpcy5pdGVyYXRpb24oKSAmIDEpID8gMSAtIHZhbHVlIDogdmFsdWUpICsgX2VsYXBzZWRDeWNsZUR1cmF0aW9uKHRoaXMpLCBzdXBwcmVzc0V2ZW50cykgOiB0aGlzLmR1cmF0aW9uKCkgPyBNYXRoLm1pbigxLCB0aGlzLl90aW1lIC8gdGhpcy5fZHVyKSA6IHRoaXMucmF0aW87XG4gICAgfTtcblxuICAgIF9wcm90by5pdGVyYXRpb24gPSBmdW5jdGlvbiBpdGVyYXRpb24odmFsdWUsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICB2YXIgY3ljbGVEdXJhdGlvbiA9IHRoaXMuZHVyYXRpb24oKSArIHRoaXMuX3JEZWxheTtcblxuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRvdGFsVGltZSh0aGlzLl90aW1lICsgKHZhbHVlIC0gMSkgKiBjeWNsZUR1cmF0aW9uLCBzdXBwcmVzc0V2ZW50cykgOiB0aGlzLl9yZXBlYXQgPyBfYW5pbWF0aW9uQ3ljbGUodGhpcy5fdFRpbWUsIGN5Y2xlRHVyYXRpb24pICsgMSA6IDE7XG4gICAgfTtcblxuICAgIF9wcm90by50aW1lU2NhbGUgPSBmdW5jdGlvbiB0aW1lU2NhbGUodmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnRzID09PSAtX3RpbnlOdW0gPyAwIDogdGhpcy5fcnRzO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcnRzID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHRUaW1lID0gdGhpcy5wYXJlbnQgJiYgdGhpcy5fdHMgPyBfcGFyZW50VG9DaGlsZFRvdGFsVGltZSh0aGlzLnBhcmVudC5fdGltZSwgdGhpcykgOiB0aGlzLl90VGltZTtcbiAgICAgIHRoaXMuX3J0cyA9ICt2YWx1ZSB8fCAwO1xuICAgICAgdGhpcy5fdHMgPSB0aGlzLl9wcyB8fCB2YWx1ZSA9PT0gLV90aW55TnVtID8gMCA6IHRoaXMuX3J0cztcblxuICAgICAgX3JlY2FjaGVBbmNlc3RvcnModGhpcy50b3RhbFRpbWUoX2NsYW1wKC10aGlzLl9kZWxheSwgdGhpcy5fdER1ciwgdFRpbWUpLCB0cnVlKSk7XG5cbiAgICAgIF9zZXRFbmQodGhpcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucGF1c2VkID0gZnVuY3Rpb24gcGF1c2VkKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BzO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcHMgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3BzID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5fcFRpbWUgPSB0aGlzLl90VGltZSB8fCBNYXRoLm1heCgtdGhpcy5fZGVsYXksIHRoaXMucmF3VGltZSgpKTtcbiAgICAgICAgICB0aGlzLl90cyA9IHRoaXMuX2FjdCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3dha2UoKTtcblxuICAgICAgICAgIHRoaXMuX3RzID0gdGhpcy5fcnRzO1xuICAgICAgICAgIHRoaXMudG90YWxUaW1lKHRoaXMucGFyZW50ICYmICF0aGlzLnBhcmVudC5zbW9vdGhDaGlsZFRpbWluZyA/IHRoaXMucmF3VGltZSgpIDogdGhpcy5fdFRpbWUgfHwgdGhpcy5fcFRpbWUsIHRoaXMucHJvZ3Jlc3MoKSA9PT0gMSAmJiBNYXRoLmFicyh0aGlzLl96VGltZSkgIT09IF90aW55TnVtICYmICh0aGlzLl90VGltZSAtPSBfdGlueU51bSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8uc3RhcnRUaW1lID0gZnVuY3Rpb24gc3RhcnRUaW1lKHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9zdGFydCA9IHZhbHVlO1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQgfHwgdGhpcy5fZHA7XG4gICAgICAgIHBhcmVudCAmJiAocGFyZW50Ll9zb3J0IHx8ICF0aGlzLnBhcmVudCkgJiYgX2FkZFRvVGltZWxpbmUocGFyZW50LCB0aGlzLCB2YWx1ZSAtIHRoaXMuX2RlbGF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9zdGFydDtcbiAgICB9O1xuXG4gICAgX3Byb3RvLmVuZFRpbWUgPSBmdW5jdGlvbiBlbmRUaW1lKGluY2x1ZGVSZXBlYXRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnQgKyAoX2lzTm90RmFsc2UoaW5jbHVkZVJlcGVhdHMpID8gdGhpcy50b3RhbER1cmF0aW9uKCkgOiB0aGlzLmR1cmF0aW9uKCkpIC8gTWF0aC5hYnModGhpcy5fdHMgfHwgMSk7XG4gICAgfTtcblxuICAgIF9wcm90by5yYXdUaW1lID0gZnVuY3Rpb24gcmF3VGltZSh3cmFwUmVwZWF0cykge1xuICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50IHx8IHRoaXMuX2RwO1xuICAgICAgcmV0dXJuICFwYXJlbnQgPyB0aGlzLl90VGltZSA6IHdyYXBSZXBlYXRzICYmICghdGhpcy5fdHMgfHwgdGhpcy5fcmVwZWF0ICYmIHRoaXMuX3RpbWUgJiYgdGhpcy50b3RhbFByb2dyZXNzKCkgPCAxKSA/IHRoaXMuX3RUaW1lICUgKHRoaXMuX2R1ciArIHRoaXMuX3JEZWxheSkgOiAhdGhpcy5fdHMgPyB0aGlzLl90VGltZSA6IF9wYXJlbnRUb0NoaWxkVG90YWxUaW1lKHBhcmVudC5yYXdUaW1lKHdyYXBSZXBlYXRzKSwgdGhpcyk7XG4gICAgfTtcblxuICAgIF9wcm90by5nbG9iYWxUaW1lID0gZnVuY3Rpb24gZ2xvYmFsVGltZShyYXdUaW1lKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gdGhpcyxcbiAgICAgICAgICB0aW1lID0gYXJndW1lbnRzLmxlbmd0aCA/IHJhd1RpbWUgOiBhbmltYXRpb24ucmF3VGltZSgpO1xuXG4gICAgICB3aGlsZSAoYW5pbWF0aW9uKSB7XG4gICAgICAgIHRpbWUgPSBhbmltYXRpb24uX3N0YXJ0ICsgdGltZSAvIChhbmltYXRpb24uX3RzIHx8IDEpO1xuICAgICAgICBhbmltYXRpb24gPSBhbmltYXRpb24uX2RwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9O1xuXG4gICAgX3Byb3RvLnJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdCh2YWx1ZSkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcmVwZWF0ID0gdmFsdWUgPT09IEluZmluaXR5ID8gLTIgOiB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIF9vblVwZGF0ZVRvdGFsRHVyYXRpb24odGhpcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9yZXBlYXQgPT09IC0yID8gSW5maW5pdHkgOiB0aGlzLl9yZXBlYXQ7XG4gICAgfTtcblxuICAgIF9wcm90by5yZXBlYXREZWxheSA9IGZ1bmN0aW9uIHJlcGVhdERlbGF5KHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICB2YXIgdGltZSA9IHRoaXMuX3RpbWU7XG4gICAgICAgIHRoaXMuX3JEZWxheSA9IHZhbHVlO1xuXG4gICAgICAgIF9vblVwZGF0ZVRvdGFsRHVyYXRpb24odGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRpbWUgPyB0aGlzLnRpbWUodGltZSkgOiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fckRlbGF5O1xuICAgIH07XG5cbiAgICBfcHJvdG8ueW95byA9IGZ1bmN0aW9uIHlveW8odmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3lveW8gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl95b3lvO1xuICAgIH07XG5cbiAgICBfcHJvdG8uc2VlayA9IGZ1bmN0aW9uIHNlZWsocG9zaXRpb24sIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy50b3RhbFRpbWUoX3BhcnNlUG9zaXRpb24odGhpcywgcG9zaXRpb24pLCBfaXNOb3RGYWxzZShzdXBwcmVzc0V2ZW50cykpO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucmVzdGFydCA9IGZ1bmN0aW9uIHJlc3RhcnQoaW5jbHVkZURlbGF5LCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMucGxheSgpLnRvdGFsVGltZShpbmNsdWRlRGVsYXkgPyAtdGhpcy5fZGVsYXkgOiAwLCBfaXNOb3RGYWxzZShzdXBwcmVzc0V2ZW50cykpO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucGxheSA9IGZ1bmN0aW9uIHBsYXkoZnJvbSwgc3VwcHJlc3NFdmVudHMpIHtcbiAgICAgIGZyb20gIT0gbnVsbCAmJiB0aGlzLnNlZWsoZnJvbSwgc3VwcHJlc3NFdmVudHMpO1xuICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZWQoZmFsc2UpLnBhdXNlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIF9wcm90by5yZXZlcnNlID0gZnVuY3Rpb24gcmV2ZXJzZShmcm9tLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgZnJvbSAhPSBudWxsICYmIHRoaXMuc2Vlayhmcm9tIHx8IHRoaXMudG90YWxEdXJhdGlvbigpLCBzdXBwcmVzc0V2ZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXZlcnNlZCh0cnVlKS5wYXVzZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucGF1c2UgPSBmdW5jdGlvbiBwYXVzZShhdFRpbWUsIHN1cHByZXNzRXZlbnRzKSB7XG4gICAgICBhdFRpbWUgIT0gbnVsbCAmJiB0aGlzLnNlZWsoYXRUaW1lLCBzdXBwcmVzc0V2ZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5wYXVzZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIF9wcm90by5yZXN1bWUgPSBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXVzZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBfcHJvdG8ucmV2ZXJzZWQgPSBmdW5jdGlvbiByZXZlcnNlZCh2YWx1ZSkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgISF2YWx1ZSAhPT0gdGhpcy5yZXZlcnNlZCgpICYmIHRoaXMudGltZVNjYWxlKC10aGlzLl9ydHMgfHwgKHZhbHVlID8gLV90aW55TnVtIDogMCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3J0cyA8IDA7XG4gICAgfTtcblxuICAgIF9wcm90by5pbnZhbGlkYXRlID0gZnVuY3Rpb24gaW52YWxpZGF0ZSgpIHtcbiAgICAgIHRoaXMuX2luaXR0ZWQgPSB0aGlzLl9hY3QgPSAwO1xuICAgICAgdGhpcy5felRpbWUgPSAtX3RpbnlOdW07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvLmlzQWN0aXZlID0gZnVuY3Rpb24gaXNBY3RpdmUoKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQgfHwgdGhpcy5fZHAsXG4gICAgICAgICAgc3RhcnQgPSB0aGlzLl9zdGFydCxcbiAgICAgICAgICByYXdUaW1lO1xuICAgICAgcmV0dXJuICEhKCFwYXJlbnQgfHwgdGhpcy5fdHMgJiYgdGhpcy5faW5pdHRlZCAmJiBwYXJlbnQuaXNBY3RpdmUoKSAmJiAocmF3VGltZSA9IHBhcmVudC5yYXdUaW1lKHRydWUpKSA+PSBzdGFydCAmJiByYXdUaW1lIDwgdGhpcy5lbmRUaW1lKHRydWUpIC0gX3RpbnlOdW0pO1xuICAgIH07XG5cbiAgICBfcHJvdG8uZXZlbnRDYWxsYmFjayA9IGZ1bmN0aW9uIGV2ZW50Q2FsbGJhY2sodHlwZSwgY2FsbGJhY2ssIHBhcmFtcykge1xuICAgICAgdmFyIHZhcnMgPSB0aGlzLnZhcnM7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgICAgZGVsZXRlIHZhcnNbdHlwZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyc1t0eXBlXSA9IGNhbGxiYWNrO1xuICAgICAgICAgIHBhcmFtcyAmJiAodmFyc1t0eXBlICsgXCJQYXJhbXNcIl0gPSBwYXJhbXMpO1xuICAgICAgICAgIHR5cGUgPT09IFwib25VcGRhdGVcIiAmJiAodGhpcy5fb25VcGRhdGUgPSBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhcnNbdHlwZV07XG4gICAgfTtcblxuICAgIF9wcm90by50aGVuID0gZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIHZhciBmID0gX2lzRnVuY3Rpb24ob25GdWxmaWxsZWQpID8gb25GdWxmaWxsZWQgOiBfcGFzc1Rocm91Z2gsXG4gICAgICAgICAgICBfcmVzb2x2ZSA9IGZ1bmN0aW9uIF9yZXNvbHZlKCkge1xuICAgICAgICAgIHZhciBfdGhlbiA9IHNlbGYudGhlbjtcbiAgICAgICAgICBzZWxmLnRoZW4gPSBudWxsO1xuICAgICAgICAgIF9pc0Z1bmN0aW9uKGYpICYmIChmID0gZihzZWxmKSkgJiYgKGYudGhlbiB8fCBmID09PSBzZWxmKSAmJiAoc2VsZi50aGVuID0gX3RoZW4pO1xuICAgICAgICAgIHJlc29sdmUoZik7XG4gICAgICAgICAgc2VsZi50aGVuID0gX3RoZW47XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHNlbGYuX2luaXR0ZWQgJiYgc2VsZi50b3RhbFByb2dyZXNzKCkgPT09IDEgJiYgc2VsZi5fdHMgPj0gMCB8fCAhc2VsZi5fdFRpbWUgJiYgc2VsZi5fdHMgPCAwKSB7XG4gICAgICAgICAgX3Jlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLl9wcm9tID0gX3Jlc29sdmU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfcHJvdG8ua2lsbCA9IGZ1bmN0aW9uIGtpbGwoKSB7XG4gICAgICBfaW50ZXJydXB0KHRoaXMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQW5pbWF0aW9uO1xuICB9KCk7XG5cbiAgX3NldERlZmF1bHRzKEFuaW1hdGlvbi5wcm90b3R5cGUsIHtcbiAgICBfdGltZTogMCxcbiAgICBfc3RhcnQ6IDAsXG4gICAgX2VuZDogMCxcbiAgICBfdFRpbWU6IDAsXG4gICAgX3REdXI6IDAsXG4gICAgX2RpcnR5OiAwLFxuICAgIF9yZXBlYXQ6IDAsXG4gICAgX3lveW86IGZhbHNlLFxuICAgIHBhcmVudDogbnVsbCxcbiAgICBfaW5pdHRlZDogZmFsc2UsXG4gICAgX3JEZWxheTogMCxcbiAgICBfdHM6IDEsXG4gICAgX2RwOiAwLFxuICAgIHJhdGlvOiAwLFxuICAgIF96VGltZTogLV90aW55TnVtLFxuICAgIF9wcm9tOiAwLFxuICAgIF9wczogZmFsc2UsXG4gICAgX3J0czogMVxuICB9KTtcblxuICB2YXIgVGltZWxpbmUgPSBmdW5jdGlvbiAoX0FuaW1hdGlvbikge1xuICAgIF9pbmhlcml0c0xvb3NlKFRpbWVsaW5lLCBfQW5pbWF0aW9uKTtcblxuICAgIGZ1bmN0aW9uIFRpbWVsaW5lKHZhcnMsIHBvc2l0aW9uKSB7XG4gICAgICB2YXIgX3RoaXM7XG5cbiAgICAgIGlmICh2YXJzID09PSB2b2lkIDApIHtcbiAgICAgICAgdmFycyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBfdGhpcyA9IF9BbmltYXRpb24uY2FsbCh0aGlzLCB2YXJzKSB8fCB0aGlzO1xuICAgICAgX3RoaXMubGFiZWxzID0ge307XG4gICAgICBfdGhpcy5zbW9vdGhDaGlsZFRpbWluZyA9ICEhdmFycy5zbW9vdGhDaGlsZFRpbWluZztcbiAgICAgIF90aGlzLmF1dG9SZW1vdmVDaGlsZHJlbiA9ICEhdmFycy5hdXRvUmVtb3ZlQ2hpbGRyZW47XG4gICAgICBfdGhpcy5fc29ydCA9IF9pc05vdEZhbHNlKHZhcnMuc29ydENoaWxkcmVuKTtcbiAgICAgIF9nbG9iYWxUaW1lbGluZSAmJiBfYWRkVG9UaW1lbGluZSh2YXJzLnBhcmVudCB8fCBfZ2xvYmFsVGltZWxpbmUsIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBwb3NpdGlvbik7XG4gICAgICB2YXJzLnJldmVyc2VkICYmIF90aGlzLnJldmVyc2UoKTtcbiAgICAgIHZhcnMucGF1c2VkICYmIF90aGlzLnBhdXNlZCh0cnVlKTtcbiAgICAgIHZhcnMuc2Nyb2xsVHJpZ2dlciAmJiBfc2Nyb2xsVHJpZ2dlcihfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgdmFycy5zY3JvbGxUcmlnZ2VyKTtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICB2YXIgX3Byb3RvMiA9IFRpbWVsaW5lLnByb3RvdHlwZTtcblxuICAgIF9wcm90bzIudG8gPSBmdW5jdGlvbiB0byh0YXJnZXRzLCB2YXJzLCBwb3NpdGlvbikge1xuICAgICAgX2NyZWF0ZVR3ZWVuVHlwZSgwLCBhcmd1bWVudHMsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5mcm9tID0gZnVuY3Rpb24gZnJvbSh0YXJnZXRzLCB2YXJzLCBwb3NpdGlvbikge1xuICAgICAgX2NyZWF0ZVR3ZWVuVHlwZSgxLCBhcmd1bWVudHMsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5mcm9tVG8gPSBmdW5jdGlvbiBmcm9tVG8odGFyZ2V0cywgZnJvbVZhcnMsIHRvVmFycywgcG9zaXRpb24pIHtcbiAgICAgIF9jcmVhdGVUd2VlblR5cGUoMiwgYXJndW1lbnRzLCB0aGlzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIuc2V0ID0gZnVuY3Rpb24gc2V0KHRhcmdldHMsIHZhcnMsIHBvc2l0aW9uKSB7XG4gICAgICB2YXJzLmR1cmF0aW9uID0gMDtcbiAgICAgIHZhcnMucGFyZW50ID0gdGhpcztcbiAgICAgIF9pbmhlcml0RGVmYXVsdHModmFycykucmVwZWF0RGVsYXkgfHwgKHZhcnMucmVwZWF0ID0gMCk7XG4gICAgICB2YXJzLmltbWVkaWF0ZVJlbmRlciA9ICEhdmFycy5pbW1lZGlhdGVSZW5kZXI7XG4gICAgICBuZXcgVHdlZW4odGFyZ2V0cywgdmFycywgX3BhcnNlUG9zaXRpb24odGhpcywgcG9zaXRpb24pLCAxKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmNhbGwgPSBmdW5jdGlvbiBjYWxsKGNhbGxiYWNrLCBwYXJhbXMsIHBvc2l0aW9uKSB7XG4gICAgICByZXR1cm4gX2FkZFRvVGltZWxpbmUodGhpcywgVHdlZW4uZGVsYXllZENhbGwoMCwgY2FsbGJhY2ssIHBhcmFtcyksIHBvc2l0aW9uKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5zdGFnZ2VyVG8gPSBmdW5jdGlvbiBzdGFnZ2VyVG8odGFyZ2V0cywgZHVyYXRpb24sIHZhcnMsIHN0YWdnZXIsIHBvc2l0aW9uLCBvbkNvbXBsZXRlQWxsLCBvbkNvbXBsZXRlQWxsUGFyYW1zKSB7XG4gICAgICB2YXJzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICB2YXJzLnN0YWdnZXIgPSB2YXJzLnN0YWdnZXIgfHwgc3RhZ2dlcjtcbiAgICAgIHZhcnMub25Db21wbGV0ZSA9IG9uQ29tcGxldGVBbGw7XG4gICAgICB2YXJzLm9uQ29tcGxldGVQYXJhbXMgPSBvbkNvbXBsZXRlQWxsUGFyYW1zO1xuICAgICAgdmFycy5wYXJlbnQgPSB0aGlzO1xuICAgICAgbmV3IFR3ZWVuKHRhcmdldHMsIHZhcnMsIF9wYXJzZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5zdGFnZ2VyRnJvbSA9IGZ1bmN0aW9uIHN0YWdnZXJGcm9tKHRhcmdldHMsIGR1cmF0aW9uLCB2YXJzLCBzdGFnZ2VyLCBwb3NpdGlvbiwgb25Db21wbGV0ZUFsbCwgb25Db21wbGV0ZUFsbFBhcmFtcykge1xuICAgICAgdmFycy5ydW5CYWNrd2FyZHMgPSAxO1xuICAgICAgX2luaGVyaXREZWZhdWx0cyh2YXJzKS5pbW1lZGlhdGVSZW5kZXIgPSBfaXNOb3RGYWxzZSh2YXJzLmltbWVkaWF0ZVJlbmRlcik7XG4gICAgICByZXR1cm4gdGhpcy5zdGFnZ2VyVG8odGFyZ2V0cywgZHVyYXRpb24sIHZhcnMsIHN0YWdnZXIsIHBvc2l0aW9uLCBvbkNvbXBsZXRlQWxsLCBvbkNvbXBsZXRlQWxsUGFyYW1zKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5zdGFnZ2VyRnJvbVRvID0gZnVuY3Rpb24gc3RhZ2dlckZyb21Ubyh0YXJnZXRzLCBkdXJhdGlvbiwgZnJvbVZhcnMsIHRvVmFycywgc3RhZ2dlciwgcG9zaXRpb24sIG9uQ29tcGxldGVBbGwsIG9uQ29tcGxldGVBbGxQYXJhbXMpIHtcbiAgICAgIHRvVmFycy5zdGFydEF0ID0gZnJvbVZhcnM7XG4gICAgICBfaW5oZXJpdERlZmF1bHRzKHRvVmFycykuaW1tZWRpYXRlUmVuZGVyID0gX2lzTm90RmFsc2UodG9WYXJzLmltbWVkaWF0ZVJlbmRlcik7XG4gICAgICByZXR1cm4gdGhpcy5zdGFnZ2VyVG8odGFyZ2V0cywgZHVyYXRpb24sIHRvVmFycywgc3RhZ2dlciwgcG9zaXRpb24sIG9uQ29tcGxldGVBbGwsIG9uQ29tcGxldGVBbGxQYXJhbXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcih0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSkge1xuICAgICAgdmFyIHByZXZUaW1lID0gdGhpcy5fdGltZSxcbiAgICAgICAgICB0RHVyID0gdGhpcy5fZGlydHkgPyB0aGlzLnRvdGFsRHVyYXRpb24oKSA6IHRoaXMuX3REdXIsXG4gICAgICAgICAgZHVyID0gdGhpcy5fZHVyLFxuICAgICAgICAgIHRUaW1lID0gdG90YWxUaW1lIDw9IDAgPyAwIDogX3JvdW5kUHJlY2lzZSh0b3RhbFRpbWUpLFxuICAgICAgICAgIGNyb3NzaW5nU3RhcnQgPSB0aGlzLl96VGltZSA8IDAgIT09IHRvdGFsVGltZSA8IDAgJiYgKHRoaXMuX2luaXR0ZWQgfHwgIWR1ciksXG4gICAgICAgICAgdGltZSxcbiAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICBuZXh0LFxuICAgICAgICAgIGl0ZXJhdGlvbixcbiAgICAgICAgICBjeWNsZUR1cmF0aW9uLFxuICAgICAgICAgIHByZXZQYXVzZWQsXG4gICAgICAgICAgcGF1c2VUd2VlbixcbiAgICAgICAgICB0aW1lU2NhbGUsXG4gICAgICAgICAgcHJldlN0YXJ0LFxuICAgICAgICAgIHByZXZJdGVyYXRpb24sXG4gICAgICAgICAgeW95byxcbiAgICAgICAgICBpc1lveW87XG4gICAgICB0aGlzICE9PSBfZ2xvYmFsVGltZWxpbmUgJiYgdFRpbWUgPiB0RHVyICYmIHRvdGFsVGltZSA+PSAwICYmICh0VGltZSA9IHREdXIpO1xuXG4gICAgICBpZiAodFRpbWUgIT09IHRoaXMuX3RUaW1lIHx8IGZvcmNlIHx8IGNyb3NzaW5nU3RhcnQpIHtcbiAgICAgICAgaWYgKHByZXZUaW1lICE9PSB0aGlzLl90aW1lICYmIGR1cikge1xuICAgICAgICAgIHRUaW1lICs9IHRoaXMuX3RpbWUgLSBwcmV2VGltZTtcbiAgICAgICAgICB0b3RhbFRpbWUgKz0gdGhpcy5fdGltZSAtIHByZXZUaW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZSA9IHRUaW1lO1xuICAgICAgICBwcmV2U3RhcnQgPSB0aGlzLl9zdGFydDtcbiAgICAgICAgdGltZVNjYWxlID0gdGhpcy5fdHM7XG4gICAgICAgIHByZXZQYXVzZWQgPSAhdGltZVNjYWxlO1xuXG4gICAgICAgIGlmIChjcm9zc2luZ1N0YXJ0KSB7XG4gICAgICAgICAgZHVyIHx8IChwcmV2VGltZSA9IHRoaXMuX3pUaW1lKTtcbiAgICAgICAgICAodG90YWxUaW1lIHx8ICFzdXBwcmVzc0V2ZW50cykgJiYgKHRoaXMuX3pUaW1lID0gdG90YWxUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9yZXBlYXQpIHtcbiAgICAgICAgICB5b3lvID0gdGhpcy5feW95bztcbiAgICAgICAgICBjeWNsZUR1cmF0aW9uID0gZHVyICsgdGhpcy5fckRlbGF5O1xuXG4gICAgICAgICAgaWYgKHRoaXMuX3JlcGVhdCA8IC0xICYmIHRvdGFsVGltZSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvdGFsVGltZShjeWNsZUR1cmF0aW9uICogMTAwICsgdG90YWxUaW1lLCBzdXBwcmVzc0V2ZW50cywgZm9yY2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRpbWUgPSBfcm91bmRQcmVjaXNlKHRUaW1lICUgY3ljbGVEdXJhdGlvbik7XG5cbiAgICAgICAgICBpZiAodFRpbWUgPT09IHREdXIpIHtcbiAgICAgICAgICAgIGl0ZXJhdGlvbiA9IHRoaXMuX3JlcGVhdDtcbiAgICAgICAgICAgIHRpbWUgPSBkdXI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZXJhdGlvbiA9IH5+KHRUaW1lIC8gY3ljbGVEdXJhdGlvbik7XG5cbiAgICAgICAgICAgIGlmIChpdGVyYXRpb24gJiYgaXRlcmF0aW9uID09PSB0VGltZSAvIGN5Y2xlRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgdGltZSA9IGR1cjtcbiAgICAgICAgICAgICAgaXRlcmF0aW9uLS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRpbWUgPiBkdXIgJiYgKHRpbWUgPSBkdXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByZXZJdGVyYXRpb24gPSBfYW5pbWF0aW9uQ3ljbGUodGhpcy5fdFRpbWUsIGN5Y2xlRHVyYXRpb24pO1xuICAgICAgICAgICFwcmV2VGltZSAmJiB0aGlzLl90VGltZSAmJiBwcmV2SXRlcmF0aW9uICE9PSBpdGVyYXRpb24gJiYgKHByZXZJdGVyYXRpb24gPSBpdGVyYXRpb24pO1xuXG4gICAgICAgICAgaWYgKHlveW8gJiYgaXRlcmF0aW9uICYgMSkge1xuICAgICAgICAgICAgdGltZSA9IGR1ciAtIHRpbWU7XG4gICAgICAgICAgICBpc1lveW8gPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpdGVyYXRpb24gIT09IHByZXZJdGVyYXRpb24gJiYgIXRoaXMuX2xvY2spIHtcbiAgICAgICAgICAgIHZhciByZXdpbmRpbmcgPSB5b3lvICYmIHByZXZJdGVyYXRpb24gJiAxLFxuICAgICAgICAgICAgICAgIGRvZXNXcmFwID0gcmV3aW5kaW5nID09PSAoeW95byAmJiBpdGVyYXRpb24gJiAxKTtcbiAgICAgICAgICAgIGl0ZXJhdGlvbiA8IHByZXZJdGVyYXRpb24gJiYgKHJld2luZGluZyA9ICFyZXdpbmRpbmcpO1xuICAgICAgICAgICAgcHJldlRpbWUgPSByZXdpbmRpbmcgPyAwIDogZHVyO1xuICAgICAgICAgICAgdGhpcy5fbG9jayA9IDE7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcihwcmV2VGltZSB8fCAoaXNZb3lvID8gMCA6IF9yb3VuZFByZWNpc2UoaXRlcmF0aW9uICogY3ljbGVEdXJhdGlvbikpLCBzdXBwcmVzc0V2ZW50cywgIWR1cikuX2xvY2sgPSAwO1xuICAgICAgICAgICAgdGhpcy5fdFRpbWUgPSB0VGltZTtcbiAgICAgICAgICAgICFzdXBwcmVzc0V2ZW50cyAmJiB0aGlzLnBhcmVudCAmJiBfY2FsbGJhY2sodGhpcywgXCJvblJlcGVhdFwiKTtcbiAgICAgICAgICAgIHRoaXMudmFycy5yZXBlYXRSZWZyZXNoICYmICFpc1lveW8gJiYgKHRoaXMuaW52YWxpZGF0ZSgpLl9sb2NrID0gMSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2VGltZSAmJiBwcmV2VGltZSAhPT0gdGhpcy5fdGltZSB8fCBwcmV2UGF1c2VkICE9PSAhdGhpcy5fdHMgfHwgdGhpcy52YXJzLm9uUmVwZWF0ICYmICF0aGlzLnBhcmVudCAmJiAhdGhpcy5fYWN0KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkdXIgPSB0aGlzLl9kdXI7XG4gICAgICAgICAgICB0RHVyID0gdGhpcy5fdER1cjtcblxuICAgICAgICAgICAgaWYgKGRvZXNXcmFwKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xvY2sgPSAyO1xuICAgICAgICAgICAgICBwcmV2VGltZSA9IHJld2luZGluZyA/IGR1ciA6IC0wLjAwMDE7XG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyKHByZXZUaW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgdGhpcy52YXJzLnJlcGVhdFJlZnJlc2ggJiYgIWlzWW95byAmJiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fbG9jayA9IDA7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fdHMgJiYgIXByZXZQYXVzZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9wcm9wYWdhdGVZb3lvRWFzZSh0aGlzLCBpc1lveW8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9oYXNQYXVzZSAmJiAhdGhpcy5fZm9yY2luZyAmJiB0aGlzLl9sb2NrIDwgMikge1xuICAgICAgICAgIHBhdXNlVHdlZW4gPSBfZmluZE5leHRQYXVzZVR3ZWVuKHRoaXMsIF9yb3VuZFByZWNpc2UocHJldlRpbWUpLCBfcm91bmRQcmVjaXNlKHRpbWUpKTtcblxuICAgICAgICAgIGlmIChwYXVzZVR3ZWVuKSB7XG4gICAgICAgICAgICB0VGltZSAtPSB0aW1lIC0gKHRpbWUgPSBwYXVzZVR3ZWVuLl9zdGFydCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdFRpbWUgPSB0VGltZTtcbiAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgIHRoaXMuX2FjdCA9ICF0aW1lU2NhbGU7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pbml0dGVkKSB7XG4gICAgICAgICAgdGhpcy5fb25VcGRhdGUgPSB0aGlzLnZhcnMub25VcGRhdGU7XG4gICAgICAgICAgdGhpcy5faW5pdHRlZCA9IDE7XG4gICAgICAgICAgdGhpcy5felRpbWUgPSB0b3RhbFRpbWU7XG4gICAgICAgICAgcHJldlRpbWUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwcmV2VGltZSAmJiB0aW1lICYmICFzdXBwcmVzc0V2ZW50cykge1xuICAgICAgICAgIF9jYWxsYmFjayh0aGlzLCBcIm9uU3RhcnRcIik7XG5cbiAgICAgICAgICBpZiAodGhpcy5fdFRpbWUgIT09IHRUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGltZSA+PSBwcmV2VGltZSAmJiB0b3RhbFRpbWUgPj0gMCkge1xuICAgICAgICAgIGNoaWxkID0gdGhpcy5fZmlyc3Q7XG5cbiAgICAgICAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgICAgICAgIG5leHQgPSBjaGlsZC5fbmV4dDtcblxuICAgICAgICAgICAgaWYgKChjaGlsZC5fYWN0IHx8IHRpbWUgPj0gY2hpbGQuX3N0YXJ0KSAmJiBjaGlsZC5fdHMgJiYgcGF1c2VUd2VlbiAhPT0gY2hpbGQpIHtcbiAgICAgICAgICAgICAgaWYgKGNoaWxkLnBhcmVudCAhPT0gdGhpcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlcih0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjaGlsZC5yZW5kZXIoY2hpbGQuX3RzID4gMCA/ICh0aW1lIC0gY2hpbGQuX3N0YXJ0KSAqIGNoaWxkLl90cyA6IChjaGlsZC5fZGlydHkgPyBjaGlsZC50b3RhbER1cmF0aW9uKCkgOiBjaGlsZC5fdER1cikgKyAodGltZSAtIGNoaWxkLl9zdGFydCkgKiBjaGlsZC5fdHMsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG5cbiAgICAgICAgICAgICAgaWYgKHRpbWUgIT09IHRoaXMuX3RpbWUgfHwgIXRoaXMuX3RzICYmICFwcmV2UGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgcGF1c2VUd2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgbmV4dCAmJiAodFRpbWUgKz0gdGhpcy5felRpbWUgPSAtX3RpbnlOdW0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoaWxkID0gbmV4dDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGQgPSB0aGlzLl9sYXN0O1xuICAgICAgICAgIHZhciBhZGp1c3RlZFRpbWUgPSB0b3RhbFRpbWUgPCAwID8gdG90YWxUaW1lIDogdGltZTtcblxuICAgICAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICAgICAgbmV4dCA9IGNoaWxkLl9wcmV2O1xuXG4gICAgICAgICAgICBpZiAoKGNoaWxkLl9hY3QgfHwgYWRqdXN0ZWRUaW1lIDw9IGNoaWxkLl9lbmQpICYmIGNoaWxkLl90cyAmJiBwYXVzZVR3ZWVuICE9PSBjaGlsZCkge1xuICAgICAgICAgICAgICBpZiAoY2hpbGQucGFyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNoaWxkLnJlbmRlcihjaGlsZC5fdHMgPiAwID8gKGFkanVzdGVkVGltZSAtIGNoaWxkLl9zdGFydCkgKiBjaGlsZC5fdHMgOiAoY2hpbGQuX2RpcnR5ID8gY2hpbGQudG90YWxEdXJhdGlvbigpIDogY2hpbGQuX3REdXIpICsgKGFkanVzdGVkVGltZSAtIGNoaWxkLl9zdGFydCkgKiBjaGlsZC5fdHMsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG5cbiAgICAgICAgICAgICAgaWYgKHRpbWUgIT09IHRoaXMuX3RpbWUgfHwgIXRoaXMuX3RzICYmICFwcmV2UGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgcGF1c2VUd2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgbmV4dCAmJiAodFRpbWUgKz0gdGhpcy5felRpbWUgPSBhZGp1c3RlZFRpbWUgPyAtX3RpbnlOdW0gOiBfdGlueU51bSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hpbGQgPSBuZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXVzZVR3ZWVuICYmICFzdXBwcmVzc0V2ZW50cykge1xuICAgICAgICAgIHRoaXMucGF1c2UoKTtcbiAgICAgICAgICBwYXVzZVR3ZWVuLnJlbmRlcih0aW1lID49IHByZXZUaW1lID8gMCA6IC1fdGlueU51bSkuX3pUaW1lID0gdGltZSA+PSBwcmV2VGltZSA/IDEgOiAtMTtcblxuICAgICAgICAgIGlmICh0aGlzLl90cykge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnQgPSBwcmV2U3RhcnQ7XG5cbiAgICAgICAgICAgIF9zZXRFbmQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlcih0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fb25VcGRhdGUgJiYgIXN1cHByZXNzRXZlbnRzICYmIF9jYWxsYmFjayh0aGlzLCBcIm9uVXBkYXRlXCIsIHRydWUpO1xuICAgICAgICBpZiAodFRpbWUgPT09IHREdXIgJiYgdER1ciA+PSB0aGlzLnRvdGFsRHVyYXRpb24oKSB8fCAhdFRpbWUgJiYgcHJldlRpbWUpIGlmIChwcmV2U3RhcnQgPT09IHRoaXMuX3N0YXJ0IHx8IE1hdGguYWJzKHRpbWVTY2FsZSkgIT09IE1hdGguYWJzKHRoaXMuX3RzKSkgaWYgKCF0aGlzLl9sb2NrKSB7XG4gICAgICAgICAgKHRvdGFsVGltZSB8fCAhZHVyKSAmJiAodFRpbWUgPT09IHREdXIgJiYgdGhpcy5fdHMgPiAwIHx8ICF0VGltZSAmJiB0aGlzLl90cyA8IDApICYmIF9yZW1vdmVGcm9tUGFyZW50KHRoaXMsIDEpO1xuXG4gICAgICAgICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiAhKHRvdGFsVGltZSA8IDAgJiYgIXByZXZUaW1lKSAmJiAodFRpbWUgfHwgcHJldlRpbWUgfHwgIXREdXIpKSB7XG4gICAgICAgICAgICBfY2FsbGJhY2sodGhpcywgdFRpbWUgPT09IHREdXIgJiYgdG90YWxUaW1lID49IDAgPyBcIm9uQ29tcGxldGVcIiA6IFwib25SZXZlcnNlQ29tcGxldGVcIiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb20gJiYgISh0VGltZSA8IHREdXIgJiYgdGhpcy50aW1lU2NhbGUoKSA+IDApICYmIHRoaXMuX3Byb20oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIuYWRkID0gZnVuY3Rpb24gYWRkKGNoaWxkLCBwb3NpdGlvbikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIF9pc051bWJlcihwb3NpdGlvbikgfHwgKHBvc2l0aW9uID0gX3BhcnNlUG9zaXRpb24odGhpcywgcG9zaXRpb24sIGNoaWxkKSk7XG5cbiAgICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgQW5pbWF0aW9uKSkge1xuICAgICAgICBpZiAoX2lzQXJyYXkoY2hpbGQpKSB7XG4gICAgICAgICAgY2hpbGQuZm9yRWFjaChmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMyLmFkZChvYmosIHBvc2l0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNTdHJpbmcoY2hpbGQpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTGFiZWwoY2hpbGQsIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjaGlsZCkpIHtcbiAgICAgICAgICBjaGlsZCA9IFR3ZWVuLmRlbGF5ZWRDYWxsKDAsIGNoaWxkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcyAhPT0gY2hpbGQgPyBfYWRkVG9UaW1lbGluZSh0aGlzLCBjaGlsZCwgcG9zaXRpb24pIDogdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5nZXRDaGlsZHJlbiA9IGZ1bmN0aW9uIGdldENoaWxkcmVuKG5lc3RlZCwgdHdlZW5zLCB0aW1lbGluZXMsIGlnbm9yZUJlZm9yZVRpbWUpIHtcbiAgICAgIGlmIChuZXN0ZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBuZXN0ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHdlZW5zID09PSB2b2lkIDApIHtcbiAgICAgICAgdHdlZW5zID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWVsaW5lcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRpbWVsaW5lcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpZ25vcmVCZWZvcmVUaW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgaWdub3JlQmVmb3JlVGltZSA9IC1fYmlnTnVtO1xuICAgICAgfVxuXG4gICAgICB2YXIgYSA9IFtdLFxuICAgICAgICAgIGNoaWxkID0gdGhpcy5fZmlyc3Q7XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQuX3N0YXJ0ID49IGlnbm9yZUJlZm9yZVRpbWUpIHtcbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUd2Vlbikge1xuICAgICAgICAgICAgdHdlZW5zICYmIGEucHVzaChjaGlsZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVsaW5lcyAmJiBhLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgbmVzdGVkICYmIGEucHVzaC5hcHBseShhLCBjaGlsZC5nZXRDaGlsZHJlbih0cnVlLCB0d2VlbnMsIHRpbWVsaW5lcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmdldEJ5SWQgPSBmdW5jdGlvbiBnZXRCeUlkKGlkKSB7XG4gICAgICB2YXIgYW5pbWF0aW9ucyA9IHRoaXMuZ2V0Q2hpbGRyZW4oMSwgMSwgMSksXG4gICAgICAgICAgaSA9IGFuaW1hdGlvbnMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25zW2ldLnZhcnMuaWQgPT09IGlkKSB7XG4gICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3Byb3RvMi5yZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUoY2hpbGQpIHtcbiAgICAgIGlmIChfaXNTdHJpbmcoY2hpbGQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUxhYmVsKGNoaWxkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNoaWxkKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5raWxsVHdlZW5zT2YoY2hpbGQpO1xuICAgICAgfVxuXG4gICAgICBfcmVtb3ZlTGlua2VkTGlzdEl0ZW0odGhpcywgY2hpbGQpO1xuXG4gICAgICBpZiAoY2hpbGQgPT09IHRoaXMuX3JlY2VudCkge1xuICAgICAgICB0aGlzLl9yZWNlbnQgPSB0aGlzLl9sYXN0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3VuY2FjaGUodGhpcyk7XG4gICAgfTtcblxuICAgIF9wcm90bzIudG90YWxUaW1lID0gZnVuY3Rpb24gdG90YWxUaW1lKF90b3RhbFRpbWUyLCBzdXBwcmVzc0V2ZW50cykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90VGltZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZm9yY2luZyA9IDE7XG5cbiAgICAgIGlmICghdGhpcy5fZHAgJiYgdGhpcy5fdHMpIHtcbiAgICAgICAgdGhpcy5fc3RhcnQgPSBfcm91bmRQcmVjaXNlKF90aWNrZXIudGltZSAtICh0aGlzLl90cyA+IDAgPyBfdG90YWxUaW1lMiAvIHRoaXMuX3RzIDogKHRoaXMudG90YWxEdXJhdGlvbigpIC0gX3RvdGFsVGltZTIpIC8gLXRoaXMuX3RzKSk7XG4gICAgICB9XG5cbiAgICAgIF9BbmltYXRpb24ucHJvdG90eXBlLnRvdGFsVGltZS5jYWxsKHRoaXMsIF90b3RhbFRpbWUyLCBzdXBwcmVzc0V2ZW50cyk7XG5cbiAgICAgIHRoaXMuX2ZvcmNpbmcgPSAwO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIuYWRkTGFiZWwgPSBmdW5jdGlvbiBhZGRMYWJlbChsYWJlbCwgcG9zaXRpb24pIHtcbiAgICAgIHRoaXMubGFiZWxzW2xhYmVsXSA9IF9wYXJzZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnJlbW92ZUxhYmVsID0gZnVuY3Rpb24gcmVtb3ZlTGFiZWwobGFiZWwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmxhYmVsc1tsYWJlbF07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5hZGRQYXVzZSA9IGZ1bmN0aW9uIGFkZFBhdXNlKHBvc2l0aW9uLCBjYWxsYmFjaywgcGFyYW1zKSB7XG4gICAgICB2YXIgdCA9IFR3ZWVuLmRlbGF5ZWRDYWxsKDAsIGNhbGxiYWNrIHx8IF9lbXB0eUZ1bmMsIHBhcmFtcyk7XG4gICAgICB0LmRhdGEgPSBcImlzUGF1c2VcIjtcbiAgICAgIHRoaXMuX2hhc1BhdXNlID0gMTtcbiAgICAgIHJldHVybiBfYWRkVG9UaW1lbGluZSh0aGlzLCB0LCBfcGFyc2VQb3NpdGlvbih0aGlzLCBwb3NpdGlvbikpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnJlbW92ZVBhdXNlID0gZnVuY3Rpb24gcmVtb3ZlUGF1c2UocG9zaXRpb24pIHtcbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuX2ZpcnN0O1xuICAgICAgcG9zaXRpb24gPSBfcGFyc2VQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQuX3N0YXJ0ID09PSBwb3NpdGlvbiAmJiBjaGlsZC5kYXRhID09PSBcImlzUGF1c2VcIikge1xuICAgICAgICAgIF9yZW1vdmVGcm9tUGFyZW50KGNoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9wcm90bzIua2lsbFR3ZWVuc09mID0gZnVuY3Rpb24ga2lsbFR3ZWVuc09mKHRhcmdldHMsIHByb3BzLCBvbmx5QWN0aXZlKSB7XG4gICAgICB2YXIgdHdlZW5zID0gdGhpcy5nZXRUd2VlbnNPZih0YXJnZXRzLCBvbmx5QWN0aXZlKSxcbiAgICAgICAgICBpID0gdHdlZW5zLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBfb3ZlcndyaXRpbmdUd2VlbiAhPT0gdHdlZW5zW2ldICYmIHR3ZWVuc1tpXS5raWxsKHRhcmdldHMsIHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzIuZ2V0VHdlZW5zT2YgPSBmdW5jdGlvbiBnZXRUd2VlbnNPZih0YXJnZXRzLCBvbmx5QWN0aXZlKSB7XG4gICAgICB2YXIgYSA9IFtdLFxuICAgICAgICAgIHBhcnNlZFRhcmdldHMgPSB0b0FycmF5KHRhcmdldHMpLFxuICAgICAgICAgIGNoaWxkID0gdGhpcy5fZmlyc3QsXG4gICAgICAgICAgaXNHbG9iYWxUaW1lID0gX2lzTnVtYmVyKG9ubHlBY3RpdmUpLFxuICAgICAgICAgIGNoaWxkcmVuO1xuXG4gICAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgVHdlZW4pIHtcbiAgICAgICAgICBpZiAoX2FycmF5Q29udGFpbnNBbnkoY2hpbGQuX3RhcmdldHMsIHBhcnNlZFRhcmdldHMpICYmIChpc0dsb2JhbFRpbWUgPyAoIV9vdmVyd3JpdGluZ1R3ZWVuIHx8IGNoaWxkLl9pbml0dGVkICYmIGNoaWxkLl90cykgJiYgY2hpbGQuZ2xvYmFsVGltZSgwKSA8PSBvbmx5QWN0aXZlICYmIGNoaWxkLmdsb2JhbFRpbWUoY2hpbGQudG90YWxEdXJhdGlvbigpKSA+IG9ubHlBY3RpdmUgOiAhb25seUFjdGl2ZSB8fCBjaGlsZC5pc0FjdGl2ZSgpKSkge1xuICAgICAgICAgICAgYS5wdXNoKGNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoKGNoaWxkcmVuID0gY2hpbGQuZ2V0VHdlZW5zT2YocGFyc2VkVGFyZ2V0cywgb25seUFjdGl2ZSkpLmxlbmd0aCkge1xuICAgICAgICAgIGEucHVzaC5hcHBseShhLCBjaGlsZHJlbik7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IGNoaWxkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi50d2VlblRvID0gZnVuY3Rpb24gdHdlZW5Ubyhwb3NpdGlvbiwgdmFycykge1xuICAgICAgdmFycyA9IHZhcnMgfHwge307XG5cbiAgICAgIHZhciB0bCA9IHRoaXMsXG4gICAgICAgICAgZW5kVGltZSA9IF9wYXJzZVBvc2l0aW9uKHRsLCBwb3NpdGlvbiksXG4gICAgICAgICAgX3ZhcnMgPSB2YXJzLFxuICAgICAgICAgIHN0YXJ0QXQgPSBfdmFycy5zdGFydEF0LFxuICAgICAgICAgIF9vblN0YXJ0ID0gX3ZhcnMub25TdGFydCxcbiAgICAgICAgICBvblN0YXJ0UGFyYW1zID0gX3ZhcnMub25TdGFydFBhcmFtcyxcbiAgICAgICAgICBpbW1lZGlhdGVSZW5kZXIgPSBfdmFycy5pbW1lZGlhdGVSZW5kZXIsXG4gICAgICAgICAgaW5pdHRlZCxcbiAgICAgICAgICB0d2VlbiA9IFR3ZWVuLnRvKHRsLCBfc2V0RGVmYXVsdHMoe1xuICAgICAgICBlYXNlOiB2YXJzLmVhc2UgfHwgXCJub25lXCIsXG4gICAgICAgIGxhenk6IGZhbHNlLFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6IGZhbHNlLFxuICAgICAgICB0aW1lOiBlbmRUaW1lLFxuICAgICAgICBvdmVyd3JpdGU6IFwiYXV0b1wiLFxuICAgICAgICBkdXJhdGlvbjogdmFycy5kdXJhdGlvbiB8fCBNYXRoLmFicygoZW5kVGltZSAtIChzdGFydEF0ICYmIFwidGltZVwiIGluIHN0YXJ0QXQgPyBzdGFydEF0LnRpbWUgOiB0bC5fdGltZSkpIC8gdGwudGltZVNjYWxlKCkpIHx8IF90aW55TnVtLFxuICAgICAgICBvblN0YXJ0OiBmdW5jdGlvbiBvblN0YXJ0KCkge1xuICAgICAgICAgIHRsLnBhdXNlKCk7XG5cbiAgICAgICAgICBpZiAoIWluaXR0ZWQpIHtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHZhcnMuZHVyYXRpb24gfHwgTWF0aC5hYnMoKGVuZFRpbWUgLSAoc3RhcnRBdCAmJiBcInRpbWVcIiBpbiBzdGFydEF0ID8gc3RhcnRBdC50aW1lIDogdGwuX3RpbWUpKSAvIHRsLnRpbWVTY2FsZSgpKTtcbiAgICAgICAgICAgIHR3ZWVuLl9kdXIgIT09IGR1cmF0aW9uICYmIF9zZXREdXJhdGlvbih0d2VlbiwgZHVyYXRpb24sIDAsIDEpLnJlbmRlcih0d2Vlbi5fdGltZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpbml0dGVkID0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfb25TdGFydCAmJiBfb25TdGFydC5hcHBseSh0d2Vlbiwgb25TdGFydFBhcmFtcyB8fCBbXSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHZhcnMpKTtcblxuICAgICAgcmV0dXJuIGltbWVkaWF0ZVJlbmRlciA/IHR3ZWVuLnJlbmRlcigwKSA6IHR3ZWVuO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnR3ZWVuRnJvbVRvID0gZnVuY3Rpb24gdHdlZW5Gcm9tVG8oZnJvbVBvc2l0aW9uLCB0b1Bvc2l0aW9uLCB2YXJzKSB7XG4gICAgICByZXR1cm4gdGhpcy50d2VlblRvKHRvUG9zaXRpb24sIF9zZXREZWZhdWx0cyh7XG4gICAgICAgIHN0YXJ0QXQ6IHtcbiAgICAgICAgICB0aW1lOiBfcGFyc2VQb3NpdGlvbih0aGlzLCBmcm9tUG9zaXRpb24pXG4gICAgICAgIH1cbiAgICAgIH0sIHZhcnMpKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5yZWNlbnQgPSBmdW5jdGlvbiByZWNlbnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVjZW50O1xuICAgIH07XG5cbiAgICBfcHJvdG8yLm5leHRMYWJlbCA9IGZ1bmN0aW9uIG5leHRMYWJlbChhZnRlclRpbWUpIHtcbiAgICAgIGlmIChhZnRlclRpbWUgPT09IHZvaWQgMCkge1xuICAgICAgICBhZnRlclRpbWUgPSB0aGlzLl90aW1lO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX2dldExhYmVsSW5EaXJlY3Rpb24odGhpcywgX3BhcnNlUG9zaXRpb24odGhpcywgYWZ0ZXJUaW1lKSk7XG4gICAgfTtcblxuICAgIF9wcm90bzIucHJldmlvdXNMYWJlbCA9IGZ1bmN0aW9uIHByZXZpb3VzTGFiZWwoYmVmb3JlVGltZSkge1xuICAgICAgaWYgKGJlZm9yZVRpbWUgPT09IHZvaWQgMCkge1xuICAgICAgICBiZWZvcmVUaW1lID0gdGhpcy5fdGltZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9nZXRMYWJlbEluRGlyZWN0aW9uKHRoaXMsIF9wYXJzZVBvc2l0aW9uKHRoaXMsIGJlZm9yZVRpbWUpLCAxKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5jdXJyZW50TGFiZWwgPSBmdW5jdGlvbiBjdXJyZW50TGFiZWwodmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy5zZWVrKHZhbHVlLCB0cnVlKSA6IHRoaXMucHJldmlvdXNMYWJlbCh0aGlzLl90aW1lICsgX3RpbnlOdW0pO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnNoaWZ0Q2hpbGRyZW4gPSBmdW5jdGlvbiBzaGlmdENoaWxkcmVuKGFtb3VudCwgYWRqdXN0TGFiZWxzLCBpZ25vcmVCZWZvcmVUaW1lKSB7XG4gICAgICBpZiAoaWdub3JlQmVmb3JlVGltZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGlnbm9yZUJlZm9yZVRpbWUgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hpbGQgPSB0aGlzLl9maXJzdCxcbiAgICAgICAgICBsYWJlbHMgPSB0aGlzLmxhYmVscyxcbiAgICAgICAgICBwO1xuXG4gICAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkLl9zdGFydCA+PSBpZ25vcmVCZWZvcmVUaW1lKSB7XG4gICAgICAgICAgY2hpbGQuX3N0YXJ0ICs9IGFtb3VudDtcbiAgICAgICAgICBjaGlsZC5fZW5kICs9IGFtb3VudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChhZGp1c3RMYWJlbHMpIHtcbiAgICAgICAgZm9yIChwIGluIGxhYmVscykge1xuICAgICAgICAgIGlmIChsYWJlbHNbcF0gPj0gaWdub3JlQmVmb3JlVGltZSkge1xuICAgICAgICAgICAgbGFiZWxzW3BdICs9IGFtb3VudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF91bmNhY2hlKHRoaXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLmludmFsaWRhdGUgPSBmdW5jdGlvbiBpbnZhbGlkYXRlKCkge1xuICAgICAgdmFyIGNoaWxkID0gdGhpcy5fZmlyc3Q7XG4gICAgICB0aGlzLl9sb2NrID0gMDtcblxuICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgIGNoaWxkLmludmFsaWRhdGUoKTtcbiAgICAgICAgY2hpbGQgPSBjaGlsZC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9BbmltYXRpb24ucHJvdG90eXBlLmludmFsaWRhdGUuY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgX3Byb3RvMi5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyKGluY2x1ZGVMYWJlbHMpIHtcbiAgICAgIGlmIChpbmNsdWRlTGFiZWxzID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5jbHVkZUxhYmVscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuX2ZpcnN0LFxuICAgICAgICAgIG5leHQ7XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBuZXh0ID0gY2hpbGQuX25leHQ7XG4gICAgICAgIHRoaXMucmVtb3ZlKGNoaWxkKTtcbiAgICAgICAgY2hpbGQgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9kcCAmJiAodGhpcy5fdGltZSA9IHRoaXMuX3RUaW1lID0gdGhpcy5fcFRpbWUgPSAwKTtcbiAgICAgIGluY2x1ZGVMYWJlbHMgJiYgKHRoaXMubGFiZWxzID0ge30pO1xuICAgICAgcmV0dXJuIF91bmNhY2hlKHRoaXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8yLnRvdGFsRHVyYXRpb24gPSBmdW5jdGlvbiB0b3RhbER1cmF0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgbWF4ID0gMCxcbiAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICBjaGlsZCA9IHNlbGYuX2xhc3QsXG4gICAgICAgICAgcHJldlN0YXJ0ID0gX2JpZ051bSxcbiAgICAgICAgICBwcmV2LFxuICAgICAgICAgIHN0YXJ0LFxuICAgICAgICAgIHBhcmVudDtcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYudGltZVNjYWxlKChzZWxmLl9yZXBlYXQgPCAwID8gc2VsZi5kdXJhdGlvbigpIDogc2VsZi50b3RhbER1cmF0aW9uKCkpIC8gKHNlbGYucmV2ZXJzZWQoKSA/IC12YWx1ZSA6IHZhbHVlKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl9kaXJ0eSkge1xuICAgICAgICBwYXJlbnQgPSBzZWxmLnBhcmVudDtcblxuICAgICAgICB3aGlsZSAoY2hpbGQpIHtcbiAgICAgICAgICBwcmV2ID0gY2hpbGQuX3ByZXY7XG4gICAgICAgICAgY2hpbGQuX2RpcnR5ICYmIGNoaWxkLnRvdGFsRHVyYXRpb24oKTtcbiAgICAgICAgICBzdGFydCA9IGNoaWxkLl9zdGFydDtcblxuICAgICAgICAgIGlmIChzdGFydCA+IHByZXZTdGFydCAmJiBzZWxmLl9zb3J0ICYmIGNoaWxkLl90cyAmJiAhc2VsZi5fbG9jaykge1xuICAgICAgICAgICAgc2VsZi5fbG9jayA9IDE7XG4gICAgICAgICAgICBfYWRkVG9UaW1lbGluZShzZWxmLCBjaGlsZCwgc3RhcnQgLSBjaGlsZC5fZGVsYXksIDEpLl9sb2NrID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJldlN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgMCAmJiBjaGlsZC5fdHMpIHtcbiAgICAgICAgICAgIG1heCAtPSBzdGFydDtcblxuICAgICAgICAgICAgaWYgKCFwYXJlbnQgJiYgIXNlbGYuX2RwIHx8IHBhcmVudCAmJiBwYXJlbnQuc21vb3RoQ2hpbGRUaW1pbmcpIHtcbiAgICAgICAgICAgICAgc2VsZi5fc3RhcnQgKz0gc3RhcnQgLyBzZWxmLl90cztcbiAgICAgICAgICAgICAgc2VsZi5fdGltZSAtPSBzdGFydDtcbiAgICAgICAgICAgICAgc2VsZi5fdFRpbWUgLT0gc3RhcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuc2hpZnRDaGlsZHJlbigtc3RhcnQsIGZhbHNlLCAtMWU5OTkpO1xuICAgICAgICAgICAgcHJldlN0YXJ0ID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaGlsZC5fZW5kID4gbWF4ICYmIGNoaWxkLl90cyAmJiAobWF4ID0gY2hpbGQuX2VuZCk7XG4gICAgICAgICAgY2hpbGQgPSBwcmV2O1xuICAgICAgICB9XG5cbiAgICAgICAgX3NldER1cmF0aW9uKHNlbGYsIHNlbGYgPT09IF9nbG9iYWxUaW1lbGluZSAmJiBzZWxmLl90aW1lID4gbWF4ID8gc2VsZi5fdGltZSA6IG1heCwgMSwgMSk7XG5cbiAgICAgICAgc2VsZi5fZGlydHkgPSAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5fdER1cjtcbiAgICB9O1xuXG4gICAgVGltZWxpbmUudXBkYXRlUm9vdCA9IGZ1bmN0aW9uIHVwZGF0ZVJvb3QodGltZSkge1xuICAgICAgaWYgKF9nbG9iYWxUaW1lbGluZS5fdHMpIHtcbiAgICAgICAgX2xhenlTYWZlUmVuZGVyKF9nbG9iYWxUaW1lbGluZSwgX3BhcmVudFRvQ2hpbGRUb3RhbFRpbWUodGltZSwgX2dsb2JhbFRpbWVsaW5lKSk7XG5cbiAgICAgICAgX2xhc3RSZW5kZXJlZEZyYW1lID0gX3RpY2tlci5mcmFtZTtcbiAgICAgIH1cblxuICAgICAgaWYgKF90aWNrZXIuZnJhbWUgPj0gX25leHRHQ0ZyYW1lKSB7XG4gICAgICAgIF9uZXh0R0NGcmFtZSArPSBfY29uZmlnLmF1dG9TbGVlcCB8fCAxMjA7XG4gICAgICAgIHZhciBjaGlsZCA9IF9nbG9iYWxUaW1lbGluZS5fZmlyc3Q7XG4gICAgICAgIGlmICghY2hpbGQgfHwgIWNoaWxkLl90cykgaWYgKF9jb25maWcuYXV0b1NsZWVwICYmIF90aWNrZXIuX2xpc3RlbmVycy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgd2hpbGUgKGNoaWxkICYmICFjaGlsZC5fdHMpIHtcbiAgICAgICAgICAgIGNoaWxkID0gY2hpbGQuX25leHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2hpbGQgfHwgX3RpY2tlci5zbGVlcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBUaW1lbGluZTtcbiAgfShBbmltYXRpb24pO1xuXG4gIF9zZXREZWZhdWx0cyhUaW1lbGluZS5wcm90b3R5cGUsIHtcbiAgICBfbG9jazogMCxcbiAgICBfaGFzUGF1c2U6IDAsXG4gICAgX2ZvcmNpbmc6IDBcbiAgfSk7XG5cbiAgdmFyIF9hZGRDb21wbGV4U3RyaW5nUHJvcFR3ZWVuID0gZnVuY3Rpb24gX2FkZENvbXBsZXhTdHJpbmdQcm9wVHdlZW4odGFyZ2V0LCBwcm9wLCBzdGFydCwgZW5kLCBzZXR0ZXIsIHN0cmluZ0ZpbHRlciwgZnVuY1BhcmFtKSB7XG4gICAgdmFyIHB0ID0gbmV3IFByb3BUd2Vlbih0aGlzLl9wdCwgdGFyZ2V0LCBwcm9wLCAwLCAxLCBfcmVuZGVyQ29tcGxleFN0cmluZywgbnVsbCwgc2V0dGVyKSxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBtYXRjaEluZGV4ID0gMCxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBzdGFydE51bXMsXG4gICAgICAgIGNvbG9yLFxuICAgICAgICBlbmROdW0sXG4gICAgICAgIGNodW5rLFxuICAgICAgICBzdGFydE51bSxcbiAgICAgICAgaGFzUmFuZG9tLFxuICAgICAgICBhO1xuICAgIHB0LmIgPSBzdGFydDtcbiAgICBwdC5lID0gZW5kO1xuICAgIHN0YXJ0ICs9IFwiXCI7XG4gICAgZW5kICs9IFwiXCI7XG5cbiAgICBpZiAoaGFzUmFuZG9tID0gfmVuZC5pbmRleE9mKFwicmFuZG9tKFwiKSkge1xuICAgICAgZW5kID0gX3JlcGxhY2VSYW5kb20oZW5kKTtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nRmlsdGVyKSB7XG4gICAgICBhID0gW3N0YXJ0LCBlbmRdO1xuICAgICAgc3RyaW5nRmlsdGVyKGEsIHRhcmdldCwgcHJvcCk7XG4gICAgICBzdGFydCA9IGFbMF07XG4gICAgICBlbmQgPSBhWzFdO1xuICAgIH1cblxuICAgIHN0YXJ0TnVtcyA9IHN0YXJ0Lm1hdGNoKF9jb21wbGV4U3RyaW5nTnVtRXhwKSB8fCBbXTtcblxuICAgIHdoaWxlIChyZXN1bHQgPSBfY29tcGxleFN0cmluZ051bUV4cC5leGVjKGVuZCkpIHtcbiAgICAgIGVuZE51bSA9IHJlc3VsdFswXTtcbiAgICAgIGNodW5rID0gZW5kLnN1YnN0cmluZyhpbmRleCwgcmVzdWx0LmluZGV4KTtcblxuICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIGNvbG9yID0gKGNvbG9yICsgMSkgJSA1O1xuICAgICAgfSBlbHNlIGlmIChjaHVuay5zdWJzdHIoLTUpID09PSBcInJnYmEoXCIpIHtcbiAgICAgICAgY29sb3IgPSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5kTnVtICE9PSBzdGFydE51bXNbbWF0Y2hJbmRleCsrXSkge1xuICAgICAgICBzdGFydE51bSA9IHBhcnNlRmxvYXQoc3RhcnROdW1zW21hdGNoSW5kZXggLSAxXSkgfHwgMDtcbiAgICAgICAgcHQuX3B0ID0ge1xuICAgICAgICAgIF9uZXh0OiBwdC5fcHQsXG4gICAgICAgICAgcDogY2h1bmsgfHwgbWF0Y2hJbmRleCA9PT0gMSA/IGNodW5rIDogXCIsXCIsXG4gICAgICAgICAgczogc3RhcnROdW0sXG4gICAgICAgICAgYzogZW5kTnVtLmNoYXJBdCgxKSA9PT0gXCI9XCIgPyBwYXJzZUZsb2F0KGVuZE51bS5zdWJzdHIoMikpICogKGVuZE51bS5jaGFyQXQoMCkgPT09IFwiLVwiID8gLTEgOiAxKSA6IHBhcnNlRmxvYXQoZW5kTnVtKSAtIHN0YXJ0TnVtLFxuICAgICAgICAgIG06IGNvbG9yICYmIGNvbG9yIDwgNCA/IE1hdGgucm91bmQgOiAwXG4gICAgICAgIH07XG4gICAgICAgIGluZGV4ID0gX2NvbXBsZXhTdHJpbmdOdW1FeHAubGFzdEluZGV4O1xuICAgICAgfVxuICAgIH1cblxuICAgIHB0LmMgPSBpbmRleCA8IGVuZC5sZW5ndGggPyBlbmQuc3Vic3RyaW5nKGluZGV4LCBlbmQubGVuZ3RoKSA6IFwiXCI7XG4gICAgcHQuZnAgPSBmdW5jUGFyYW07XG5cbiAgICBpZiAoX3JlbEV4cC50ZXN0KGVuZCkgfHwgaGFzUmFuZG9tKSB7XG4gICAgICBwdC5lID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLl9wdCA9IHB0O1xuICAgIHJldHVybiBwdDtcbiAgfSxcbiAgICAgIF9hZGRQcm9wVHdlZW4gPSBmdW5jdGlvbiBfYWRkUHJvcFR3ZWVuKHRhcmdldCwgcHJvcCwgc3RhcnQsIGVuZCwgaW5kZXgsIHRhcmdldHMsIG1vZGlmaWVyLCBzdHJpbmdGaWx0ZXIsIGZ1bmNQYXJhbSkge1xuICAgIF9pc0Z1bmN0aW9uKGVuZCkgJiYgKGVuZCA9IGVuZChpbmRleCB8fCAwLCB0YXJnZXQsIHRhcmdldHMpKTtcbiAgICB2YXIgY3VycmVudFZhbHVlID0gdGFyZ2V0W3Byb3BdLFxuICAgICAgICBwYXJzZWRTdGFydCA9IHN0YXJ0ICE9PSBcImdldFwiID8gc3RhcnQgOiAhX2lzRnVuY3Rpb24oY3VycmVudFZhbHVlKSA/IGN1cnJlbnRWYWx1ZSA6IGZ1bmNQYXJhbSA/IHRhcmdldFtwcm9wLmluZGV4T2YoXCJzZXRcIikgfHwgIV9pc0Z1bmN0aW9uKHRhcmdldFtcImdldFwiICsgcHJvcC5zdWJzdHIoMyldKSA/IHByb3AgOiBcImdldFwiICsgcHJvcC5zdWJzdHIoMyldKGZ1bmNQYXJhbSkgOiB0YXJnZXRbcHJvcF0oKSxcbiAgICAgICAgc2V0dGVyID0gIV9pc0Z1bmN0aW9uKGN1cnJlbnRWYWx1ZSkgPyBfc2V0dGVyUGxhaW4gOiBmdW5jUGFyYW0gPyBfc2V0dGVyRnVuY1dpdGhQYXJhbSA6IF9zZXR0ZXJGdW5jLFxuICAgICAgICBwdDtcblxuICAgIGlmIChfaXNTdHJpbmcoZW5kKSkge1xuICAgICAgaWYgKH5lbmQuaW5kZXhPZihcInJhbmRvbShcIikpIHtcbiAgICAgICAgZW5kID0gX3JlcGxhY2VSYW5kb20oZW5kKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuZC5jaGFyQXQoMSkgPT09IFwiPVwiKSB7XG4gICAgICAgIHB0ID0gcGFyc2VGbG9hdChwYXJzZWRTdGFydCkgKyBwYXJzZUZsb2F0KGVuZC5zdWJzdHIoMikpICogKGVuZC5jaGFyQXQoMCkgPT09IFwiLVwiID8gLTEgOiAxKSArIChnZXRVbml0KHBhcnNlZFN0YXJ0KSB8fCAwKTtcblxuICAgICAgICBpZiAocHQgfHwgcHQgPT09IDApIHtcbiAgICAgICAgICBlbmQgPSBwdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJzZWRTdGFydCAhPT0gZW5kKSB7XG4gICAgICBpZiAoIWlzTmFOKHBhcnNlZFN0YXJ0ICogZW5kKSAmJiBlbmQgIT09IFwiXCIpIHtcbiAgICAgICAgcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCB0YXJnZXQsIHByb3AsICtwYXJzZWRTdGFydCB8fCAwLCBlbmQgLSAocGFyc2VkU3RhcnQgfHwgMCksIHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwiYm9vbGVhblwiID8gX3JlbmRlckJvb2xlYW4gOiBfcmVuZGVyUGxhaW4sIDAsIHNldHRlcik7XG4gICAgICAgIGZ1bmNQYXJhbSAmJiAocHQuZnAgPSBmdW5jUGFyYW0pO1xuICAgICAgICBtb2RpZmllciAmJiBwdC5tb2RpZmllcihtb2RpZmllciwgdGhpcywgdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3B0ID0gcHQ7XG4gICAgICB9XG5cbiAgICAgICFjdXJyZW50VmFsdWUgJiYgIShwcm9wIGluIHRhcmdldCkgJiYgX21pc3NpbmdQbHVnaW4ocHJvcCwgZW5kKTtcbiAgICAgIHJldHVybiBfYWRkQ29tcGxleFN0cmluZ1Byb3BUd2Vlbi5jYWxsKHRoaXMsIHRhcmdldCwgcHJvcCwgcGFyc2VkU3RhcnQsIGVuZCwgc2V0dGVyLCBzdHJpbmdGaWx0ZXIgfHwgX2NvbmZpZy5zdHJpbmdGaWx0ZXIsIGZ1bmNQYXJhbSk7XG4gICAgfVxuICB9LFxuICAgICAgX3Byb2Nlc3NWYXJzID0gZnVuY3Rpb24gX3Byb2Nlc3NWYXJzKHZhcnMsIGluZGV4LCB0YXJnZXQsIHRhcmdldHMsIHR3ZWVuKSB7XG4gICAgX2lzRnVuY3Rpb24odmFycykgJiYgKHZhcnMgPSBfcGFyc2VGdW5jT3JTdHJpbmcodmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpKTtcblxuICAgIGlmICghX2lzT2JqZWN0KHZhcnMpIHx8IHZhcnMuc3R5bGUgJiYgdmFycy5ub2RlVHlwZSB8fCBfaXNBcnJheSh2YXJzKSB8fCBfaXNUeXBlZEFycmF5KHZhcnMpKSB7XG4gICAgICByZXR1cm4gX2lzU3RyaW5nKHZhcnMpID8gX3BhcnNlRnVuY09yU3RyaW5nKHZhcnMsIHR3ZWVuLCBpbmRleCwgdGFyZ2V0LCB0YXJnZXRzKSA6IHZhcnM7XG4gICAgfVxuXG4gICAgdmFyIGNvcHkgPSB7fSxcbiAgICAgICAgcDtcblxuICAgIGZvciAocCBpbiB2YXJzKSB7XG4gICAgICBjb3B5W3BdID0gX3BhcnNlRnVuY09yU3RyaW5nKHZhcnNbcF0sIHR3ZWVuLCBpbmRleCwgdGFyZ2V0LCB0YXJnZXRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29weTtcbiAgfSxcbiAgICAgIF9jaGVja1BsdWdpbiA9IGZ1bmN0aW9uIF9jaGVja1BsdWdpbihwcm9wZXJ0eSwgdmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpIHtcbiAgICB2YXIgcGx1Z2luLCBwdCwgcHRMb29rdXAsIGk7XG5cbiAgICBpZiAoX3BsdWdpbnNbcHJvcGVydHldICYmIChwbHVnaW4gPSBuZXcgX3BsdWdpbnNbcHJvcGVydHldKCkpLmluaXQodGFyZ2V0LCBwbHVnaW4ucmF3VmFycyA/IHZhcnNbcHJvcGVydHldIDogX3Byb2Nlc3NWYXJzKHZhcnNbcHJvcGVydHldLCBpbmRleCwgdGFyZ2V0LCB0YXJnZXRzLCB0d2VlbiksIHR3ZWVuLCBpbmRleCwgdGFyZ2V0cykgIT09IGZhbHNlKSB7XG4gICAgICB0d2Vlbi5fcHQgPSBwdCA9IG5ldyBQcm9wVHdlZW4odHdlZW4uX3B0LCB0YXJnZXQsIHByb3BlcnR5LCAwLCAxLCBwbHVnaW4ucmVuZGVyLCBwbHVnaW4sIDAsIHBsdWdpbi5wcmlvcml0eSk7XG5cbiAgICAgIGlmICh0d2VlbiAhPT0gX3F1aWNrVHdlZW4pIHtcbiAgICAgICAgcHRMb29rdXAgPSB0d2Vlbi5fcHRMb29rdXBbdHdlZW4uX3RhcmdldHMuaW5kZXhPZih0YXJnZXQpXTtcbiAgICAgICAgaSA9IHBsdWdpbi5fcHJvcHMubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICBwdExvb2t1cFtwbHVnaW4uX3Byb3BzW2ldXSA9IHB0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBsdWdpbjtcbiAgfSxcbiAgICAgIF9vdmVyd3JpdGluZ1R3ZWVuLFxuICAgICAgX2luaXRUd2VlbiA9IGZ1bmN0aW9uIF9pbml0VHdlZW4odHdlZW4sIHRpbWUpIHtcbiAgICB2YXIgdmFycyA9IHR3ZWVuLnZhcnMsXG4gICAgICAgIGVhc2UgPSB2YXJzLmVhc2UsXG4gICAgICAgIHN0YXJ0QXQgPSB2YXJzLnN0YXJ0QXQsXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlciA9IHZhcnMuaW1tZWRpYXRlUmVuZGVyLFxuICAgICAgICBsYXp5ID0gdmFycy5sYXp5LFxuICAgICAgICBvblVwZGF0ZSA9IHZhcnMub25VcGRhdGUsXG4gICAgICAgIG9uVXBkYXRlUGFyYW1zID0gdmFycy5vblVwZGF0ZVBhcmFtcyxcbiAgICAgICAgY2FsbGJhY2tTY29wZSA9IHZhcnMuY2FsbGJhY2tTY29wZSxcbiAgICAgICAgcnVuQmFja3dhcmRzID0gdmFycy5ydW5CYWNrd2FyZHMsXG4gICAgICAgIHlveW9FYXNlID0gdmFycy55b3lvRWFzZSxcbiAgICAgICAga2V5ZnJhbWVzID0gdmFycy5rZXlmcmFtZXMsXG4gICAgICAgIGF1dG9SZXZlcnQgPSB2YXJzLmF1dG9SZXZlcnQsXG4gICAgICAgIGR1ciA9IHR3ZWVuLl9kdXIsXG4gICAgICAgIHByZXZTdGFydEF0ID0gdHdlZW4uX3N0YXJ0QXQsXG4gICAgICAgIHRhcmdldHMgPSB0d2Vlbi5fdGFyZ2V0cyxcbiAgICAgICAgcGFyZW50ID0gdHdlZW4ucGFyZW50LFxuICAgICAgICBmdWxsVGFyZ2V0cyA9IHBhcmVudCAmJiBwYXJlbnQuZGF0YSA9PT0gXCJuZXN0ZWRcIiA/IHBhcmVudC5wYXJlbnQuX3RhcmdldHMgOiB0YXJnZXRzLFxuICAgICAgICBhdXRvT3ZlcndyaXRlID0gdHdlZW4uX292ZXJ3cml0ZSA9PT0gXCJhdXRvXCIgJiYgIV9zdXBwcmVzc092ZXJ3cml0ZXMsXG4gICAgICAgIHRsID0gdHdlZW4udGltZWxpbmUsXG4gICAgICAgIGNsZWFuVmFycyxcbiAgICAgICAgaSxcbiAgICAgICAgcCxcbiAgICAgICAgcHQsXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgaGFzUHJpb3JpdHksXG4gICAgICAgIGdzRGF0YSxcbiAgICAgICAgaGFybmVzcyxcbiAgICAgICAgcGx1Z2luLFxuICAgICAgICBwdExvb2t1cCxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGhhcm5lc3NWYXJzLFxuICAgICAgICBvdmVyd3JpdHRlbjtcbiAgICB0bCAmJiAoIWtleWZyYW1lcyB8fCAhZWFzZSkgJiYgKGVhc2UgPSBcIm5vbmVcIik7XG4gICAgdHdlZW4uX2Vhc2UgPSBfcGFyc2VFYXNlKGVhc2UsIF9kZWZhdWx0cy5lYXNlKTtcbiAgICB0d2Vlbi5feUVhc2UgPSB5b3lvRWFzZSA/IF9pbnZlcnRFYXNlKF9wYXJzZUVhc2UoeW95b0Vhc2UgPT09IHRydWUgPyBlYXNlIDogeW95b0Vhc2UsIF9kZWZhdWx0cy5lYXNlKSkgOiAwO1xuXG4gICAgaWYgKHlveW9FYXNlICYmIHR3ZWVuLl95b3lvICYmICF0d2Vlbi5fcmVwZWF0KSB7XG4gICAgICB5b3lvRWFzZSA9IHR3ZWVuLl95RWFzZTtcbiAgICAgIHR3ZWVuLl95RWFzZSA9IHR3ZWVuLl9lYXNlO1xuICAgICAgdHdlZW4uX2Vhc2UgPSB5b3lvRWFzZTtcbiAgICB9XG5cbiAgICB0d2Vlbi5fZnJvbSA9ICF0bCAmJiAhIXZhcnMucnVuQmFja3dhcmRzO1xuXG4gICAgaWYgKCF0bCB8fCBrZXlmcmFtZXMgJiYgIXZhcnMuc3RhZ2dlcikge1xuICAgICAgaGFybmVzcyA9IHRhcmdldHNbMF0gPyBfZ2V0Q2FjaGUodGFyZ2V0c1swXSkuaGFybmVzcyA6IDA7XG4gICAgICBoYXJuZXNzVmFycyA9IGhhcm5lc3MgJiYgdmFyc1toYXJuZXNzLnByb3BdO1xuICAgICAgY2xlYW5WYXJzID0gX2NvcHlFeGNsdWRpbmcodmFycywgX3Jlc2VydmVkUHJvcHMpO1xuICAgICAgcHJldlN0YXJ0QXQgJiYgX3JlbW92ZUZyb21QYXJlbnQocHJldlN0YXJ0QXQucmVuZGVyKC0xLCB0cnVlKSk7XG5cbiAgICAgIGlmIChzdGFydEF0KSB7XG4gICAgICAgIF9yZW1vdmVGcm9tUGFyZW50KHR3ZWVuLl9zdGFydEF0ID0gVHdlZW4uc2V0KHRhcmdldHMsIF9zZXREZWZhdWx0cyh7XG4gICAgICAgICAgZGF0YTogXCJpc1N0YXJ0XCIsXG4gICAgICAgICAgb3ZlcndyaXRlOiBmYWxzZSxcbiAgICAgICAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICAgICAgICBpbW1lZGlhdGVSZW5kZXI6IHRydWUsXG4gICAgICAgICAgbGF6eTogX2lzTm90RmFsc2UobGF6eSksXG4gICAgICAgICAgc3RhcnRBdDogbnVsbCxcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgICBvblVwZGF0ZTogb25VcGRhdGUsXG4gICAgICAgICAgb25VcGRhdGVQYXJhbXM6IG9uVXBkYXRlUGFyYW1zLFxuICAgICAgICAgIGNhbGxiYWNrU2NvcGU6IGNhbGxiYWNrU2NvcGUsXG4gICAgICAgICAgc3RhZ2dlcjogMFxuICAgICAgICB9LCBzdGFydEF0KSkpO1xuXG4gICAgICAgIHRpbWUgPCAwICYmICFpbW1lZGlhdGVSZW5kZXIgJiYgIWF1dG9SZXZlcnQgJiYgdHdlZW4uX3N0YXJ0QXQucmVuZGVyKC0xLCB0cnVlKTtcblxuICAgICAgICBpZiAoaW1tZWRpYXRlUmVuZGVyKSB7XG4gICAgICAgICAgdGltZSA+IDAgJiYgIWF1dG9SZXZlcnQgJiYgKHR3ZWVuLl9zdGFydEF0ID0gMCk7XG5cbiAgICAgICAgICBpZiAoZHVyICYmIHRpbWUgPD0gMCkge1xuICAgICAgICAgICAgdGltZSAmJiAodHdlZW4uX3pUaW1lID0gdGltZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGF1dG9SZXZlcnQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdHdlZW4uX3N0YXJ0QXQgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJ1bkJhY2t3YXJkcyAmJiBkdXIpIHtcbiAgICAgICAgaWYgKHByZXZTdGFydEF0KSB7XG4gICAgICAgICAgIWF1dG9SZXZlcnQgJiYgKHR3ZWVuLl9zdGFydEF0ID0gMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGltZSAmJiAoaW1tZWRpYXRlUmVuZGVyID0gZmFsc2UpO1xuICAgICAgICAgIHAgPSBfc2V0RGVmYXVsdHMoe1xuICAgICAgICAgICAgb3ZlcndyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IFwiaXNGcm9tU3RhcnRcIixcbiAgICAgICAgICAgIGxhenk6IGltbWVkaWF0ZVJlbmRlciAmJiBfaXNOb3RGYWxzZShsYXp5KSxcbiAgICAgICAgICAgIGltbWVkaWF0ZVJlbmRlcjogaW1tZWRpYXRlUmVuZGVyLFxuICAgICAgICAgICAgc3RhZ2dlcjogMCxcbiAgICAgICAgICAgIHBhcmVudDogcGFyZW50XG4gICAgICAgICAgfSwgY2xlYW5WYXJzKTtcbiAgICAgICAgICBoYXJuZXNzVmFycyAmJiAocFtoYXJuZXNzLnByb3BdID0gaGFybmVzc1ZhcnMpO1xuXG4gICAgICAgICAgX3JlbW92ZUZyb21QYXJlbnQodHdlZW4uX3N0YXJ0QXQgPSBUd2Vlbi5zZXQodGFyZ2V0cywgcCkpO1xuXG4gICAgICAgICAgdGltZSA8IDAgJiYgdHdlZW4uX3N0YXJ0QXQucmVuZGVyKC0xLCB0cnVlKTtcbiAgICAgICAgICB0d2Vlbi5felRpbWUgPSB0aW1lO1xuXG4gICAgICAgICAgaWYgKCFpbW1lZGlhdGVSZW5kZXIpIHtcbiAgICAgICAgICAgIF9pbml0VHdlZW4odHdlZW4uX3N0YXJ0QXQsIF90aW55TnVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCF0aW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHR3ZWVuLl9wdCA9IDA7XG4gICAgICBsYXp5ID0gZHVyICYmIF9pc05vdEZhbHNlKGxhenkpIHx8IGxhenkgJiYgIWR1cjtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcbiAgICAgICAgZ3NEYXRhID0gdGFyZ2V0Ll9nc2FwIHx8IF9oYXJuZXNzKHRhcmdldHMpW2ldLl9nc2FwO1xuICAgICAgICB0d2Vlbi5fcHRMb29rdXBbaV0gPSBwdExvb2t1cCA9IHt9O1xuICAgICAgICBfbGF6eUxvb2t1cFtnc0RhdGEuaWRdICYmIF9sYXp5VHdlZW5zLmxlbmd0aCAmJiBfbGF6eVJlbmRlcigpO1xuICAgICAgICBpbmRleCA9IGZ1bGxUYXJnZXRzID09PSB0YXJnZXRzID8gaSA6IGZ1bGxUYXJnZXRzLmluZGV4T2YodGFyZ2V0KTtcblxuICAgICAgICBpZiAoaGFybmVzcyAmJiAocGx1Z2luID0gbmV3IGhhcm5lc3MoKSkuaW5pdCh0YXJnZXQsIGhhcm5lc3NWYXJzIHx8IGNsZWFuVmFycywgdHdlZW4sIGluZGV4LCBmdWxsVGFyZ2V0cykgIT09IGZhbHNlKSB7XG4gICAgICAgICAgdHdlZW4uX3B0ID0gcHQgPSBuZXcgUHJvcFR3ZWVuKHR3ZWVuLl9wdCwgdGFyZ2V0LCBwbHVnaW4ubmFtZSwgMCwgMSwgcGx1Z2luLnJlbmRlciwgcGx1Z2luLCAwLCBwbHVnaW4ucHJpb3JpdHkpO1xuXG4gICAgICAgICAgcGx1Z2luLl9wcm9wcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBwdExvb2t1cFtuYW1lXSA9IHB0O1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcGx1Z2luLnByaW9yaXR5ICYmIChoYXNQcmlvcml0eSA9IDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXJuZXNzIHx8IGhhcm5lc3NWYXJzKSB7XG4gICAgICAgICAgZm9yIChwIGluIGNsZWFuVmFycykge1xuICAgICAgICAgICAgaWYgKF9wbHVnaW5zW3BdICYmIChwbHVnaW4gPSBfY2hlY2tQbHVnaW4ocCwgY2xlYW5WYXJzLCB0d2VlbiwgaW5kZXgsIHRhcmdldCwgZnVsbFRhcmdldHMpKSkge1xuICAgICAgICAgICAgICBwbHVnaW4ucHJpb3JpdHkgJiYgKGhhc1ByaW9yaXR5ID0gMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwdExvb2t1cFtwXSA9IHB0ID0gX2FkZFByb3BUd2Vlbi5jYWxsKHR3ZWVuLCB0YXJnZXQsIHAsIFwiZ2V0XCIsIGNsZWFuVmFyc1twXSwgaW5kZXgsIGZ1bGxUYXJnZXRzLCAwLCB2YXJzLnN0cmluZ0ZpbHRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHdlZW4uX29wICYmIHR3ZWVuLl9vcFtpXSAmJiB0d2Vlbi5raWxsKHRhcmdldCwgdHdlZW4uX29wW2ldKTtcblxuICAgICAgICBpZiAoYXV0b092ZXJ3cml0ZSAmJiB0d2Vlbi5fcHQpIHtcbiAgICAgICAgICBfb3ZlcndyaXRpbmdUd2VlbiA9IHR3ZWVuO1xuXG4gICAgICAgICAgX2dsb2JhbFRpbWVsaW5lLmtpbGxUd2VlbnNPZih0YXJnZXQsIHB0TG9va3VwLCB0d2Vlbi5nbG9iYWxUaW1lKHRpbWUpKTtcblxuICAgICAgICAgIG92ZXJ3cml0dGVuID0gIXR3ZWVuLnBhcmVudDtcbiAgICAgICAgICBfb3ZlcndyaXRpbmdUd2VlbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0d2Vlbi5fcHQgJiYgbGF6eSAmJiAoX2xhenlMb29rdXBbZ3NEYXRhLmlkXSA9IDEpO1xuICAgICAgfVxuXG4gICAgICBoYXNQcmlvcml0eSAmJiBfc29ydFByb3BUd2VlbnNCeVByaW9yaXR5KHR3ZWVuKTtcbiAgICAgIHR3ZWVuLl9vbkluaXQgJiYgdHdlZW4uX29uSW5pdCh0d2Vlbik7XG4gICAgfVxuXG4gICAgdHdlZW4uX29uVXBkYXRlID0gb25VcGRhdGU7XG4gICAgdHdlZW4uX2luaXR0ZWQgPSAoIXR3ZWVuLl9vcCB8fCB0d2Vlbi5fcHQpICYmICFvdmVyd3JpdHRlbjtcbiAgICBrZXlmcmFtZXMgJiYgdGltZSA8PSAwICYmIHRsLnJlbmRlcihfYmlnTnVtLCB0cnVlLCB0cnVlKTtcbiAgfSxcbiAgICAgIF9hZGRBbGlhc2VzVG9WYXJzID0gZnVuY3Rpb24gX2FkZEFsaWFzZXNUb1ZhcnModGFyZ2V0cywgdmFycykge1xuICAgIHZhciBoYXJuZXNzID0gdGFyZ2V0c1swXSA/IF9nZXRDYWNoZSh0YXJnZXRzWzBdKS5oYXJuZXNzIDogMCxcbiAgICAgICAgcHJvcGVydHlBbGlhc2VzID0gaGFybmVzcyAmJiBoYXJuZXNzLmFsaWFzZXMsXG4gICAgICAgIGNvcHksXG4gICAgICAgIHAsXG4gICAgICAgIGksXG4gICAgICAgIGFsaWFzZXM7XG5cbiAgICBpZiAoIXByb3BlcnR5QWxpYXNlcykge1xuICAgICAgcmV0dXJuIHZhcnM7XG4gICAgfVxuXG4gICAgY29weSA9IF9tZXJnZSh7fSwgdmFycyk7XG5cbiAgICBmb3IgKHAgaW4gcHJvcGVydHlBbGlhc2VzKSB7XG4gICAgICBpZiAocCBpbiBjb3B5KSB7XG4gICAgICAgIGFsaWFzZXMgPSBwcm9wZXJ0eUFsaWFzZXNbcF0uc3BsaXQoXCIsXCIpO1xuICAgICAgICBpID0gYWxpYXNlcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIGNvcHlbYWxpYXNlc1tpXV0gPSBjb3B5W3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvcHk7XG4gIH0sXG4gICAgICBfcGFyc2VLZXlmcmFtZSA9IGZ1bmN0aW9uIF9wYXJzZUtleWZyYW1lKHByb3AsIG9iaiwgYWxsUHJvcHMsIGVhc2VFYWNoKSB7XG4gICAgdmFyIGVhc2UgPSBvYmouZWFzZSB8fCBlYXNlRWFjaCB8fCBcInBvd2VyMS5pbk91dFwiLFxuICAgICAgICBwLFxuICAgICAgICBhO1xuXG4gICAgaWYgKF9pc0FycmF5KG9iaikpIHtcbiAgICAgIGEgPSBhbGxQcm9wc1twcm9wXSB8fCAoYWxsUHJvcHNbcHJvcF0gPSBbXSk7XG4gICAgICBvYmouZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgcmV0dXJuIGEucHVzaCh7XG4gICAgICAgICAgdDogaSAvIChvYmoubGVuZ3RoIC0gMSkgKiAxMDAsXG4gICAgICAgICAgdjogdmFsdWUsXG4gICAgICAgICAgZTogZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHAgaW4gb2JqKSB7XG4gICAgICAgIGEgPSBhbGxQcm9wc1twXSB8fCAoYWxsUHJvcHNbcF0gPSBbXSk7XG4gICAgICAgIHAgPT09IFwiZWFzZVwiIHx8IGEucHVzaCh7XG4gICAgICAgICAgdDogcGFyc2VGbG9hdChwcm9wKSxcbiAgICAgICAgICB2OiBvYmpbcF0sXG4gICAgICAgICAgZTogZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfcGFyc2VGdW5jT3JTdHJpbmcgPSBmdW5jdGlvbiBfcGFyc2VGdW5jT3JTdHJpbmcodmFsdWUsIHR3ZWVuLCBpLCB0YXJnZXQsIHRhcmdldHMpIHtcbiAgICByZXR1cm4gX2lzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbCh0d2VlbiwgaSwgdGFyZ2V0LCB0YXJnZXRzKSA6IF9pc1N0cmluZyh2YWx1ZSkgJiYgfnZhbHVlLmluZGV4T2YoXCJyYW5kb20oXCIpID8gX3JlcGxhY2VSYW5kb20odmFsdWUpIDogdmFsdWU7XG4gIH0sXG4gICAgICBfc3RhZ2dlclR3ZWVuUHJvcHMgPSBfY2FsbGJhY2tOYW1lcyArIFwicmVwZWF0LHJlcGVhdERlbGF5LHlveW8scmVwZWF0UmVmcmVzaCx5b3lvRWFzZVwiLFxuICAgICAgX3N0YWdnZXJQcm9wc1RvU2tpcCA9IHt9O1xuXG4gIF9mb3JFYWNoTmFtZShfc3RhZ2dlclR3ZWVuUHJvcHMgKyBcIixpZCxzdGFnZ2VyLGRlbGF5LGR1cmF0aW9uLHBhdXNlZCxzY3JvbGxUcmlnZ2VyXCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIF9zdGFnZ2VyUHJvcHNUb1NraXBbbmFtZV0gPSAxO1xuICB9KTtcblxuICB2YXIgVHdlZW4gPSBmdW5jdGlvbiAoX0FuaW1hdGlvbjIpIHtcbiAgICBfaW5oZXJpdHNMb29zZShUd2VlbiwgX0FuaW1hdGlvbjIpO1xuXG4gICAgZnVuY3Rpb24gVHdlZW4odGFyZ2V0cywgdmFycywgcG9zaXRpb24sIHNraXBJbmhlcml0KSB7XG4gICAgICB2YXIgX3RoaXMzO1xuXG4gICAgICBpZiAodHlwZW9mIHZhcnMgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcG9zaXRpb24uZHVyYXRpb24gPSB2YXJzO1xuICAgICAgICB2YXJzID0gcG9zaXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgX3RoaXMzID0gX0FuaW1hdGlvbjIuY2FsbCh0aGlzLCBza2lwSW5oZXJpdCA/IHZhcnMgOiBfaW5oZXJpdERlZmF1bHRzKHZhcnMpKSB8fCB0aGlzO1xuICAgICAgdmFyIF90aGlzMyR2YXJzID0gX3RoaXMzLnZhcnMsXG4gICAgICAgICAgZHVyYXRpb24gPSBfdGhpczMkdmFycy5kdXJhdGlvbixcbiAgICAgICAgICBkZWxheSA9IF90aGlzMyR2YXJzLmRlbGF5LFxuICAgICAgICAgIGltbWVkaWF0ZVJlbmRlciA9IF90aGlzMyR2YXJzLmltbWVkaWF0ZVJlbmRlcixcbiAgICAgICAgICBzdGFnZ2VyID0gX3RoaXMzJHZhcnMuc3RhZ2dlcixcbiAgICAgICAgICBvdmVyd3JpdGUgPSBfdGhpczMkdmFycy5vdmVyd3JpdGUsXG4gICAgICAgICAga2V5ZnJhbWVzID0gX3RoaXMzJHZhcnMua2V5ZnJhbWVzLFxuICAgICAgICAgIGRlZmF1bHRzID0gX3RoaXMzJHZhcnMuZGVmYXVsdHMsXG4gICAgICAgICAgc2Nyb2xsVHJpZ2dlciA9IF90aGlzMyR2YXJzLnNjcm9sbFRyaWdnZXIsXG4gICAgICAgICAgeW95b0Vhc2UgPSBfdGhpczMkdmFycy55b3lvRWFzZSxcbiAgICAgICAgICBwYXJlbnQgPSB2YXJzLnBhcmVudCB8fCBfZ2xvYmFsVGltZWxpbmUsXG4gICAgICAgICAgcGFyc2VkVGFyZ2V0cyA9IChfaXNBcnJheSh0YXJnZXRzKSB8fCBfaXNUeXBlZEFycmF5KHRhcmdldHMpID8gX2lzTnVtYmVyKHRhcmdldHNbMF0pIDogXCJsZW5ndGhcIiBpbiB2YXJzKSA/IFt0YXJnZXRzXSA6IHRvQXJyYXkodGFyZ2V0cyksXG4gICAgICAgICAgdGwsXG4gICAgICAgICAgaSxcbiAgICAgICAgICBjb3B5LFxuICAgICAgICAgIGwsXG4gICAgICAgICAgcCxcbiAgICAgICAgICBjdXJUYXJnZXQsXG4gICAgICAgICAgc3RhZ2dlckZ1bmMsXG4gICAgICAgICAgc3RhZ2dlclZhcnNUb01lcmdlO1xuICAgICAgX3RoaXMzLl90YXJnZXRzID0gcGFyc2VkVGFyZ2V0cy5sZW5ndGggPyBfaGFybmVzcyhwYXJzZWRUYXJnZXRzKSA6IF93YXJuKFwiR1NBUCB0YXJnZXQgXCIgKyB0YXJnZXRzICsgXCIgbm90IGZvdW5kLiBodHRwczovL2dyZWVuc29jay5jb21cIiwgIV9jb25maWcubnVsbFRhcmdldFdhcm4pIHx8IFtdO1xuICAgICAgX3RoaXMzLl9wdExvb2t1cCA9IFtdO1xuICAgICAgX3RoaXMzLl9vdmVyd3JpdGUgPSBvdmVyd3JpdGU7XG5cbiAgICAgIGlmIChrZXlmcmFtZXMgfHwgc3RhZ2dlciB8fCBfaXNGdW5jT3JTdHJpbmcoZHVyYXRpb24pIHx8IF9pc0Z1bmNPclN0cmluZyhkZWxheSkpIHtcbiAgICAgICAgdmFycyA9IF90aGlzMy52YXJzO1xuICAgICAgICB0bCA9IF90aGlzMy50aW1lbGluZSA9IG5ldyBUaW1lbGluZSh7XG4gICAgICAgICAgZGF0YTogXCJuZXN0ZWRcIixcbiAgICAgICAgICBkZWZhdWx0czogZGVmYXVsdHMgfHwge31cbiAgICAgICAgfSk7XG4gICAgICAgIHRsLmtpbGwoKTtcbiAgICAgICAgdGwucGFyZW50ID0gdGwuX2RwID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpO1xuICAgICAgICB0bC5fc3RhcnQgPSAwO1xuXG4gICAgICAgIGlmIChzdGFnZ2VyIHx8IF9pc0Z1bmNPclN0cmluZyhkdXJhdGlvbikgfHwgX2lzRnVuY09yU3RyaW5nKGRlbGF5KSkge1xuICAgICAgICAgIGwgPSBwYXJzZWRUYXJnZXRzLmxlbmd0aDtcbiAgICAgICAgICBzdGFnZ2VyRnVuYyA9IHN0YWdnZXIgJiYgZGlzdHJpYnV0ZShzdGFnZ2VyKTtcblxuICAgICAgICAgIGlmIChfaXNPYmplY3Qoc3RhZ2dlcikpIHtcbiAgICAgICAgICAgIGZvciAocCBpbiBzdGFnZ2VyKSB7XG4gICAgICAgICAgICAgIGlmICh+X3N0YWdnZXJUd2VlblByb3BzLmluZGV4T2YocCkpIHtcbiAgICAgICAgICAgICAgICBzdGFnZ2VyVmFyc1RvTWVyZ2UgfHwgKHN0YWdnZXJWYXJzVG9NZXJnZSA9IHt9KTtcbiAgICAgICAgICAgICAgICBzdGFnZ2VyVmFyc1RvTWVyZ2VbcF0gPSBzdGFnZ2VyW3BdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgY29weSA9IF9jb3B5RXhjbHVkaW5nKHZhcnMsIF9zdGFnZ2VyUHJvcHNUb1NraXApO1xuICAgICAgICAgICAgY29weS5zdGFnZ2VyID0gMDtcbiAgICAgICAgICAgIHlveW9FYXNlICYmIChjb3B5LnlveW9FYXNlID0geW95b0Vhc2UpO1xuICAgICAgICAgICAgc3RhZ2dlclZhcnNUb01lcmdlICYmIF9tZXJnZShjb3B5LCBzdGFnZ2VyVmFyc1RvTWVyZ2UpO1xuICAgICAgICAgICAgY3VyVGFyZ2V0ID0gcGFyc2VkVGFyZ2V0c1tpXTtcbiAgICAgICAgICAgIGNvcHkuZHVyYXRpb24gPSArX3BhcnNlRnVuY09yU3RyaW5nKGR1cmF0aW9uLCBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIGksIGN1clRhcmdldCwgcGFyc2VkVGFyZ2V0cyk7XG4gICAgICAgICAgICBjb3B5LmRlbGF5ID0gKCtfcGFyc2VGdW5jT3JTdHJpbmcoZGVsYXksIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSwgaSwgY3VyVGFyZ2V0LCBwYXJzZWRUYXJnZXRzKSB8fCAwKSAtIF90aGlzMy5fZGVsYXk7XG5cbiAgICAgICAgICAgIGlmICghc3RhZ2dlciAmJiBsID09PSAxICYmIGNvcHkuZGVsYXkpIHtcbiAgICAgICAgICAgICAgX3RoaXMzLl9kZWxheSA9IGRlbGF5ID0gY29weS5kZWxheTtcbiAgICAgICAgICAgICAgX3RoaXMzLl9zdGFydCArPSBkZWxheTtcbiAgICAgICAgICAgICAgY29weS5kZWxheSA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRsLnRvKGN1clRhcmdldCwgY29weSwgc3RhZ2dlckZ1bmMgPyBzdGFnZ2VyRnVuYyhpLCBjdXJUYXJnZXQsIHBhcnNlZFRhcmdldHMpIDogMCk7XG4gICAgICAgICAgICB0bC5fZWFzZSA9IF9lYXNlTWFwLm5vbmU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGwuZHVyYXRpb24oKSA/IGR1cmF0aW9uID0gZGVsYXkgPSAwIDogX3RoaXMzLnRpbWVsaW5lID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChrZXlmcmFtZXMpIHtcbiAgICAgICAgICBfaW5oZXJpdERlZmF1bHRzKF9zZXREZWZhdWx0cyh0bC52YXJzLmRlZmF1bHRzLCB7XG4gICAgICAgICAgICBlYXNlOiBcIm5vbmVcIlxuICAgICAgICAgIH0pKTtcblxuICAgICAgICAgIHRsLl9lYXNlID0gX3BhcnNlRWFzZShrZXlmcmFtZXMuZWFzZSB8fCB2YXJzLmVhc2UgfHwgXCJub25lXCIpO1xuICAgICAgICAgIHZhciB0aW1lID0gMCxcbiAgICAgICAgICAgICAgYSxcbiAgICAgICAgICAgICAga2YsXG4gICAgICAgICAgICAgIHY7XG5cbiAgICAgICAgICBpZiAoX2lzQXJyYXkoa2V5ZnJhbWVzKSkge1xuICAgICAgICAgICAga2V5ZnJhbWVzLmZvckVhY2goZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0bC50byhwYXJzZWRUYXJnZXRzLCBmcmFtZSwgXCI+XCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvcHkgPSB7fTtcblxuICAgICAgICAgICAgZm9yIChwIGluIGtleWZyYW1lcykge1xuICAgICAgICAgICAgICBwID09PSBcImVhc2VcIiB8fCBwID09PSBcImVhc2VFYWNoXCIgfHwgX3BhcnNlS2V5ZnJhbWUocCwga2V5ZnJhbWVzW3BdLCBjb3B5LCBrZXlmcmFtZXMuZWFzZUVhY2gpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHAgaW4gY29weSkge1xuICAgICAgICAgICAgICBhID0gY29weVtwXS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEudCAtIGIudDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRpbWUgPSAwO1xuXG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAga2YgPSBhW2ldO1xuICAgICAgICAgICAgICAgIHYgPSB7XG4gICAgICAgICAgICAgICAgICBlYXNlOiBrZi5lLFxuICAgICAgICAgICAgICAgICAgZHVyYXRpb246IChrZi50IC0gKGkgPyBhW2kgLSAxXS50IDogMCkpIC8gMTAwICogZHVyYXRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZbcF0gPSBrZi52O1xuICAgICAgICAgICAgICAgIHRsLnRvKHBhcnNlZFRhcmdldHMsIHYsIHRpbWUpO1xuICAgICAgICAgICAgICAgIHRpbWUgKz0gdi5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0bC5kdXJhdGlvbigpIDwgZHVyYXRpb24gJiYgdGwudG8oe30sIHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uIC0gdGwuZHVyYXRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZHVyYXRpb24gfHwgX3RoaXMzLmR1cmF0aW9uKGR1cmF0aW9uID0gdGwuZHVyYXRpb24oKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpczMudGltZWxpbmUgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAob3ZlcndyaXRlID09PSB0cnVlICYmICFfc3VwcHJlc3NPdmVyd3JpdGVzKSB7XG4gICAgICAgIF9vdmVyd3JpdGluZ1R3ZWVuID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpO1xuXG4gICAgICAgIF9nbG9iYWxUaW1lbGluZS5raWxsVHdlZW5zT2YocGFyc2VkVGFyZ2V0cyk7XG5cbiAgICAgICAgX292ZXJ3cml0aW5nVHdlZW4gPSAwO1xuICAgICAgfVxuXG4gICAgICBfYWRkVG9UaW1lbGluZShwYXJlbnQsIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSwgcG9zaXRpb24pO1xuXG4gICAgICB2YXJzLnJldmVyc2VkICYmIF90aGlzMy5yZXZlcnNlKCk7XG4gICAgICB2YXJzLnBhdXNlZCAmJiBfdGhpczMucGF1c2VkKHRydWUpO1xuXG4gICAgICBpZiAoaW1tZWRpYXRlUmVuZGVyIHx8ICFkdXJhdGlvbiAmJiAha2V5ZnJhbWVzICYmIF90aGlzMy5fc3RhcnQgPT09IF9yb3VuZFByZWNpc2UocGFyZW50Ll90aW1lKSAmJiBfaXNOb3RGYWxzZShpbW1lZGlhdGVSZW5kZXIpICYmIF9oYXNOb1BhdXNlZEFuY2VzdG9ycyhfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMykpICYmIHBhcmVudC5kYXRhICE9PSBcIm5lc3RlZFwiKSB7XG4gICAgICAgIF90aGlzMy5fdFRpbWUgPSAtX3RpbnlOdW07XG5cbiAgICAgICAgX3RoaXMzLnJlbmRlcihNYXRoLm1heCgwLCAtZGVsYXkpKTtcbiAgICAgIH1cblxuICAgICAgc2Nyb2xsVHJpZ2dlciAmJiBfc2Nyb2xsVHJpZ2dlcihfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIHNjcm9sbFRyaWdnZXIpO1xuICAgICAgcmV0dXJuIF90aGlzMztcbiAgICB9XG5cbiAgICB2YXIgX3Byb3RvMyA9IFR3ZWVuLnByb3RvdHlwZTtcblxuICAgIF9wcm90bzMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKSB7XG4gICAgICB2YXIgcHJldlRpbWUgPSB0aGlzLl90aW1lLFxuICAgICAgICAgIHREdXIgPSB0aGlzLl90RHVyLFxuICAgICAgICAgIGR1ciA9IHRoaXMuX2R1cixcbiAgICAgICAgICB0VGltZSA9IHRvdGFsVGltZSA+IHREdXIgLSBfdGlueU51bSAmJiB0b3RhbFRpbWUgPj0gMCA/IHREdXIgOiB0b3RhbFRpbWUgPCBfdGlueU51bSA/IDAgOiB0b3RhbFRpbWUsXG4gICAgICAgICAgdGltZSxcbiAgICAgICAgICBwdCxcbiAgICAgICAgICBpdGVyYXRpb24sXG4gICAgICAgICAgY3ljbGVEdXJhdGlvbixcbiAgICAgICAgICBwcmV2SXRlcmF0aW9uLFxuICAgICAgICAgIGlzWW95byxcbiAgICAgICAgICByYXRpbyxcbiAgICAgICAgICB0aW1lbGluZSxcbiAgICAgICAgICB5b3lvRWFzZTtcblxuICAgICAgaWYgKCFkdXIpIHtcbiAgICAgICAgX3JlbmRlclplcm9EdXJhdGlvblR3ZWVuKHRoaXMsIHRvdGFsVGltZSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKTtcbiAgICAgIH0gZWxzZSBpZiAodFRpbWUgIT09IHRoaXMuX3RUaW1lIHx8ICF0b3RhbFRpbWUgfHwgZm9yY2UgfHwgIXRoaXMuX2luaXR0ZWQgJiYgdGhpcy5fdFRpbWUgfHwgdGhpcy5fc3RhcnRBdCAmJiB0aGlzLl96VGltZSA8IDAgIT09IHRvdGFsVGltZSA8IDApIHtcbiAgICAgICAgdGltZSA9IHRUaW1lO1xuICAgICAgICB0aW1lbGluZSA9IHRoaXMudGltZWxpbmU7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlcGVhdCkge1xuICAgICAgICAgIGN5Y2xlRHVyYXRpb24gPSBkdXIgKyB0aGlzLl9yRGVsYXk7XG5cbiAgICAgICAgICBpZiAodGhpcy5fcmVwZWF0IDwgLTEgJiYgdG90YWxUaW1lIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG90YWxUaW1lKGN5Y2xlRHVyYXRpb24gKiAxMDAgKyB0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGltZSA9IF9yb3VuZFByZWNpc2UodFRpbWUgJSBjeWNsZUR1cmF0aW9uKTtcblxuICAgICAgICAgIGlmICh0VGltZSA9PT0gdER1cikge1xuICAgICAgICAgICAgaXRlcmF0aW9uID0gdGhpcy5fcmVwZWF0O1xuICAgICAgICAgICAgdGltZSA9IGR1cjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlcmF0aW9uID0gfn4odFRpbWUgLyBjeWNsZUR1cmF0aW9uKTtcblxuICAgICAgICAgICAgaWYgKGl0ZXJhdGlvbiAmJiBpdGVyYXRpb24gPT09IHRUaW1lIC8gY3ljbGVEdXJhdGlvbikge1xuICAgICAgICAgICAgICB0aW1lID0gZHVyO1xuICAgICAgICAgICAgICBpdGVyYXRpb24tLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGltZSA+IGR1ciAmJiAodGltZSA9IGR1cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXNZb3lvID0gdGhpcy5feW95byAmJiBpdGVyYXRpb24gJiAxO1xuXG4gICAgICAgICAgaWYgKGlzWW95bykge1xuICAgICAgICAgICAgeW95b0Vhc2UgPSB0aGlzLl95RWFzZTtcbiAgICAgICAgICAgIHRpbWUgPSBkdXIgLSB0aW1lO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByZXZJdGVyYXRpb24gPSBfYW5pbWF0aW9uQ3ljbGUodGhpcy5fdFRpbWUsIGN5Y2xlRHVyYXRpb24pO1xuXG4gICAgICAgICAgaWYgKHRpbWUgPT09IHByZXZUaW1lICYmICFmb3JjZSAmJiB0aGlzLl9pbml0dGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXRlcmF0aW9uICE9PSBwcmV2SXRlcmF0aW9uKSB7XG4gICAgICAgICAgICB0aW1lbGluZSAmJiB0aGlzLl95RWFzZSAmJiBfcHJvcGFnYXRlWW95b0Vhc2UodGltZWxpbmUsIGlzWW95byk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZhcnMucmVwZWF0UmVmcmVzaCAmJiAhaXNZb3lvICYmICF0aGlzLl9sb2NrKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xvY2sgPSBmb3JjZSA9IDE7XG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyKF9yb3VuZFByZWNpc2UoY3ljbGVEdXJhdGlvbiAqIGl0ZXJhdGlvbiksIHRydWUpLmludmFsaWRhdGUoKS5fbG9jayA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pbml0dGVkKSB7XG4gICAgICAgICAgaWYgKF9hdHRlbXB0SW5pdFR3ZWVuKHRoaXMsIHRvdGFsVGltZSA8IDAgPyB0b3RhbFRpbWUgOiB0aW1lLCBmb3JjZSwgc3VwcHJlc3NFdmVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLl90VGltZSA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZHVyICE9PSB0aGlzLl9kdXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlcih0b3RhbFRpbWUsIHN1cHByZXNzRXZlbnRzLCBmb3JjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdFRpbWUgPSB0VGltZTtcbiAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9hY3QgJiYgdGhpcy5fdHMpIHtcbiAgICAgICAgICB0aGlzLl9hY3QgPSAxO1xuICAgICAgICAgIHRoaXMuX2xhenkgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yYXRpbyA9IHJhdGlvID0gKHlveW9FYXNlIHx8IHRoaXMuX2Vhc2UpKHRpbWUgLyBkdXIpO1xuXG4gICAgICAgIGlmICh0aGlzLl9mcm9tKSB7XG4gICAgICAgICAgdGhpcy5yYXRpbyA9IHJhdGlvID0gMSAtIHJhdGlvO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRpbWUgJiYgIXByZXZUaW1lICYmICFzdXBwcmVzc0V2ZW50cykge1xuICAgICAgICAgIF9jYWxsYmFjayh0aGlzLCBcIm9uU3RhcnRcIik7XG5cbiAgICAgICAgICBpZiAodGhpcy5fdFRpbWUgIT09IHRUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdCA9IHRoaXMuX3B0O1xuXG4gICAgICAgIHdoaWxlIChwdCkge1xuICAgICAgICAgIHB0LnIocmF0aW8sIHB0LmQpO1xuICAgICAgICAgIHB0ID0gcHQuX25leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lbGluZSAmJiB0aW1lbGluZS5yZW5kZXIodG90YWxUaW1lIDwgMCA/IHRvdGFsVGltZSA6ICF0aW1lICYmIGlzWW95byA/IC1fdGlueU51bSA6IHRpbWVsaW5lLl9kdXIgKiB0aW1lbGluZS5fZWFzZSh0aW1lIC8gdGhpcy5fZHVyKSwgc3VwcHJlc3NFdmVudHMsIGZvcmNlKSB8fCB0aGlzLl9zdGFydEF0ICYmICh0aGlzLl96VGltZSA9IHRvdGFsVGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX29uVXBkYXRlICYmICFzdXBwcmVzc0V2ZW50cykge1xuICAgICAgICAgIHRvdGFsVGltZSA8IDAgJiYgdGhpcy5fc3RhcnRBdCAmJiB0aGlzLl9zdGFydEF0LnJlbmRlcih0b3RhbFRpbWUsIHRydWUsIGZvcmNlKTtcblxuICAgICAgICAgIF9jYWxsYmFjayh0aGlzLCBcIm9uVXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVwZWF0ICYmIGl0ZXJhdGlvbiAhPT0gcHJldkl0ZXJhdGlvbiAmJiB0aGlzLnZhcnMub25SZXBlYXQgJiYgIXN1cHByZXNzRXZlbnRzICYmIHRoaXMucGFyZW50ICYmIF9jYWxsYmFjayh0aGlzLCBcIm9uUmVwZWF0XCIpO1xuXG4gICAgICAgIGlmICgodFRpbWUgPT09IHRoaXMuX3REdXIgfHwgIXRUaW1lKSAmJiB0aGlzLl90VGltZSA9PT0gdFRpbWUpIHtcbiAgICAgICAgICB0b3RhbFRpbWUgPCAwICYmIHRoaXMuX3N0YXJ0QXQgJiYgIXRoaXMuX29uVXBkYXRlICYmIHRoaXMuX3N0YXJ0QXQucmVuZGVyKHRvdGFsVGltZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgKHRvdGFsVGltZSB8fCAhZHVyKSAmJiAodFRpbWUgPT09IHRoaXMuX3REdXIgJiYgdGhpcy5fdHMgPiAwIHx8ICF0VGltZSAmJiB0aGlzLl90cyA8IDApICYmIF9yZW1vdmVGcm9tUGFyZW50KHRoaXMsIDEpO1xuXG4gICAgICAgICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiAhKHRvdGFsVGltZSA8IDAgJiYgIXByZXZUaW1lKSAmJiAodFRpbWUgfHwgcHJldlRpbWUpKSB7XG4gICAgICAgICAgICBfY2FsbGJhY2sodGhpcywgdFRpbWUgPT09IHREdXIgPyBcIm9uQ29tcGxldGVcIiA6IFwib25SZXZlcnNlQ29tcGxldGVcIiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb20gJiYgISh0VGltZSA8IHREdXIgJiYgdGhpcy50aW1lU2NhbGUoKSA+IDApICYmIHRoaXMuX3Byb20oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIF9wcm90bzMudGFyZ2V0cyA9IGZ1bmN0aW9uIHRhcmdldHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0cztcbiAgICB9O1xuXG4gICAgX3Byb3RvMy5pbnZhbGlkYXRlID0gZnVuY3Rpb24gaW52YWxpZGF0ZSgpIHtcbiAgICAgIHRoaXMuX3B0ID0gdGhpcy5fb3AgPSB0aGlzLl9zdGFydEF0ID0gdGhpcy5fb25VcGRhdGUgPSB0aGlzLl9sYXp5ID0gdGhpcy5yYXRpbyA9IDA7XG4gICAgICB0aGlzLl9wdExvb2t1cCA9IFtdO1xuICAgICAgdGhpcy50aW1lbGluZSAmJiB0aGlzLnRpbWVsaW5lLmludmFsaWRhdGUoKTtcbiAgICAgIHJldHVybiBfQW5pbWF0aW9uMi5wcm90b3R5cGUuaW52YWxpZGF0ZS5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICBfcHJvdG8zLmtpbGwgPSBmdW5jdGlvbiBraWxsKHRhcmdldHMsIHZhcnMpIHtcbiAgICAgIGlmICh2YXJzID09PSB2b2lkIDApIHtcbiAgICAgICAgdmFycyA9IFwiYWxsXCI7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGFyZ2V0cyAmJiAoIXZhcnMgfHwgdmFycyA9PT0gXCJhbGxcIikpIHtcbiAgICAgICAgdGhpcy5fbGF6eSA9IHRoaXMuX3B0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50ID8gX2ludGVycnVwdCh0aGlzKSA6IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRpbWVsaW5lKSB7XG4gICAgICAgIHZhciB0RHVyID0gdGhpcy50aW1lbGluZS50b3RhbER1cmF0aW9uKCk7XG4gICAgICAgIHRoaXMudGltZWxpbmUua2lsbFR3ZWVuc09mKHRhcmdldHMsIHZhcnMsIF9vdmVyd3JpdGluZ1R3ZWVuICYmIF9vdmVyd3JpdGluZ1R3ZWVuLnZhcnMub3ZlcndyaXRlICE9PSB0cnVlKS5fZmlyc3QgfHwgX2ludGVycnVwdCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJlbnQgJiYgdER1ciAhPT0gdGhpcy50aW1lbGluZS50b3RhbER1cmF0aW9uKCkgJiYgX3NldER1cmF0aW9uKHRoaXMsIHRoaXMuX2R1ciAqIHRoaXMudGltZWxpbmUuX3REdXIgLyB0RHVyLCAwLCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJzZWRUYXJnZXRzID0gdGhpcy5fdGFyZ2V0cyxcbiAgICAgICAgICBraWxsaW5nVGFyZ2V0cyA9IHRhcmdldHMgPyB0b0FycmF5KHRhcmdldHMpIDogcGFyc2VkVGFyZ2V0cyxcbiAgICAgICAgICBwcm9wVHdlZW5Mb29rdXAgPSB0aGlzLl9wdExvb2t1cCxcbiAgICAgICAgICBmaXJzdFBUID0gdGhpcy5fcHQsXG4gICAgICAgICAgb3ZlcndyaXR0ZW5Qcm9wcyxcbiAgICAgICAgICBjdXJMb29rdXAsXG4gICAgICAgICAgY3VyT3ZlcndyaXRlUHJvcHMsXG4gICAgICAgICAgcHJvcHMsXG4gICAgICAgICAgcCxcbiAgICAgICAgICBwdCxcbiAgICAgICAgICBpO1xuXG4gICAgICBpZiAoKCF2YXJzIHx8IHZhcnMgPT09IFwiYWxsXCIpICYmIF9hcnJheXNNYXRjaChwYXJzZWRUYXJnZXRzLCBraWxsaW5nVGFyZ2V0cykpIHtcbiAgICAgICAgdmFycyA9PT0gXCJhbGxcIiAmJiAodGhpcy5fcHQgPSAwKTtcbiAgICAgICAgcmV0dXJuIF9pbnRlcnJ1cHQodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIG92ZXJ3cml0dGVuUHJvcHMgPSB0aGlzLl9vcCA9IHRoaXMuX29wIHx8IFtdO1xuXG4gICAgICBpZiAodmFycyAhPT0gXCJhbGxcIikge1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHZhcnMpKSB7XG4gICAgICAgICAgcCA9IHt9O1xuXG4gICAgICAgICAgX2ZvckVhY2hOYW1lKHZhcnMsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcFtuYW1lXSA9IDE7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXJzID0gcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhcnMgPSBfYWRkQWxpYXNlc1RvVmFycyhwYXJzZWRUYXJnZXRzLCB2YXJzKTtcbiAgICAgIH1cblxuICAgICAgaSA9IHBhcnNlZFRhcmdldHMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmICh+a2lsbGluZ1RhcmdldHMuaW5kZXhPZihwYXJzZWRUYXJnZXRzW2ldKSkge1xuICAgICAgICAgIGN1ckxvb2t1cCA9IHByb3BUd2Vlbkxvb2t1cFtpXTtcblxuICAgICAgICAgIGlmICh2YXJzID09PSBcImFsbFwiKSB7XG4gICAgICAgICAgICBvdmVyd3JpdHRlblByb3BzW2ldID0gdmFycztcbiAgICAgICAgICAgIHByb3BzID0gY3VyTG9va3VwO1xuICAgICAgICAgICAgY3VyT3ZlcndyaXRlUHJvcHMgPSB7fTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VyT3ZlcndyaXRlUHJvcHMgPSBvdmVyd3JpdHRlblByb3BzW2ldID0gb3ZlcndyaXR0ZW5Qcm9wc1tpXSB8fCB7fTtcbiAgICAgICAgICAgIHByb3BzID0gdmFycztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKHAgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgIHB0ID0gY3VyTG9va3VwICYmIGN1ckxvb2t1cFtwXTtcblxuICAgICAgICAgICAgaWYgKHB0KSB7XG4gICAgICAgICAgICAgIGlmICghKFwia2lsbFwiIGluIHB0LmQpIHx8IHB0LmQua2lsbChwKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF9yZW1vdmVMaW5rZWRMaXN0SXRlbSh0aGlzLCBwdCwgXCJfcHRcIik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBkZWxldGUgY3VyTG9va3VwW3BdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3VyT3ZlcndyaXRlUHJvcHMgIT09IFwiYWxsXCIpIHtcbiAgICAgICAgICAgICAgY3VyT3ZlcndyaXRlUHJvcHNbcF0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbml0dGVkICYmICF0aGlzLl9wdCAmJiBmaXJzdFBUICYmIF9pbnRlcnJ1cHQodGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgVHdlZW4udG8gPSBmdW5jdGlvbiB0byh0YXJnZXRzLCB2YXJzKSB7XG4gICAgICByZXR1cm4gbmV3IFR3ZWVuKHRhcmdldHMsIHZhcnMsIGFyZ3VtZW50c1syXSk7XG4gICAgfTtcblxuICAgIFR3ZWVuLmZyb20gPSBmdW5jdGlvbiBmcm9tKHRhcmdldHMsIHZhcnMpIHtcbiAgICAgIHJldHVybiBfY3JlYXRlVHdlZW5UeXBlKDEsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFR3ZWVuLmRlbGF5ZWRDYWxsID0gZnVuY3Rpb24gZGVsYXllZENhbGwoZGVsYXksIGNhbGxiYWNrLCBwYXJhbXMsIHNjb3BlKSB7XG4gICAgICByZXR1cm4gbmV3IFR3ZWVuKGNhbGxiYWNrLCAwLCB7XG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjogZmFsc2UsXG4gICAgICAgIGxhenk6IGZhbHNlLFxuICAgICAgICBvdmVyd3JpdGU6IGZhbHNlLFxuICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgIG9uQ29tcGxldGU6IGNhbGxiYWNrLFxuICAgICAgICBvblJldmVyc2VDb21wbGV0ZTogY2FsbGJhY2ssXG4gICAgICAgIG9uQ29tcGxldGVQYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgb25SZXZlcnNlQ29tcGxldGVQYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgY2FsbGJhY2tTY29wZTogc2NvcGVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBUd2Vlbi5mcm9tVG8gPSBmdW5jdGlvbiBmcm9tVG8odGFyZ2V0cywgZnJvbVZhcnMsIHRvVmFycykge1xuICAgICAgcmV0dXJuIF9jcmVhdGVUd2VlblR5cGUoMiwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgVHdlZW4uc2V0ID0gZnVuY3Rpb24gc2V0KHRhcmdldHMsIHZhcnMpIHtcbiAgICAgIHZhcnMuZHVyYXRpb24gPSAwO1xuICAgICAgdmFycy5yZXBlYXREZWxheSB8fCAodmFycy5yZXBlYXQgPSAwKTtcbiAgICAgIHJldHVybiBuZXcgVHdlZW4odGFyZ2V0cywgdmFycyk7XG4gICAgfTtcblxuICAgIFR3ZWVuLmtpbGxUd2VlbnNPZiA9IGZ1bmN0aW9uIGtpbGxUd2VlbnNPZih0YXJnZXRzLCBwcm9wcywgb25seUFjdGl2ZSkge1xuICAgICAgcmV0dXJuIF9nbG9iYWxUaW1lbGluZS5raWxsVHdlZW5zT2YodGFyZ2V0cywgcHJvcHMsIG9ubHlBY3RpdmUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gVHdlZW47XG4gIH0oQW5pbWF0aW9uKTtcblxuICBfc2V0RGVmYXVsdHMoVHdlZW4ucHJvdG90eXBlLCB7XG4gICAgX3RhcmdldHM6IFtdLFxuICAgIF9sYXp5OiAwLFxuICAgIF9zdGFydEF0OiAwLFxuICAgIF9vcDogMCxcbiAgICBfb25Jbml0OiAwXG4gIH0pO1xuXG4gIF9mb3JFYWNoTmFtZShcInN0YWdnZXJUbyxzdGFnZ2VyRnJvbSxzdGFnZ2VyRnJvbVRvXCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgVHdlZW5bbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGwgPSBuZXcgVGltZWxpbmUoKSxcbiAgICAgICAgICBwYXJhbXMgPSBfc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICBwYXJhbXMuc3BsaWNlKG5hbWUgPT09IFwic3RhZ2dlckZyb21Ub1wiID8gNSA6IDQsIDAsIDApO1xuICAgICAgcmV0dXJuIHRsW25hbWVdLmFwcGx5KHRsLCBwYXJhbXMpO1xuICAgIH07XG4gIH0pO1xuXG4gIHZhciBfc2V0dGVyUGxhaW4gPSBmdW5jdGlvbiBfc2V0dGVyUGxhaW4odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuICB9LFxuICAgICAgX3NldHRlckZ1bmMgPSBmdW5jdGlvbiBfc2V0dGVyRnVuYyh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXRbcHJvcGVydHldKHZhbHVlKTtcbiAgfSxcbiAgICAgIF9zZXR0ZXJGdW5jV2l0aFBhcmFtID0gZnVuY3Rpb24gX3NldHRlckZ1bmNXaXRoUGFyYW0odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIGRhdGEpIHtcbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BlcnR5XShkYXRhLmZwLCB2YWx1ZSk7XG4gIH0sXG4gICAgICBfc2V0dGVyQXR0cmlidXRlID0gZnVuY3Rpb24gX3NldHRlckF0dHJpYnV0ZSh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXQuc2V0QXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSk7XG4gIH0sXG4gICAgICBfZ2V0U2V0dGVyID0gZnVuY3Rpb24gX2dldFNldHRlcih0YXJnZXQsIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIF9pc0Z1bmN0aW9uKHRhcmdldFtwcm9wZXJ0eV0pID8gX3NldHRlckZ1bmMgOiBfaXNVbmRlZmluZWQodGFyZ2V0W3Byb3BlcnR5XSkgJiYgdGFyZ2V0LnNldEF0dHJpYnV0ZSA/IF9zZXR0ZXJBdHRyaWJ1dGUgOiBfc2V0dGVyUGxhaW47XG4gIH0sXG4gICAgICBfcmVuZGVyUGxhaW4gPSBmdW5jdGlvbiBfcmVuZGVyUGxhaW4ocmF0aW8sIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zZXQoZGF0YS50LCBkYXRhLnAsIE1hdGgucm91bmQoKGRhdGEucyArIGRhdGEuYyAqIHJhdGlvKSAqIDEwMDAwMDApIC8gMTAwMDAwMCwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyQm9vbGVhbiA9IGZ1bmN0aW9uIF9yZW5kZXJCb29sZWFuKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCAhIShkYXRhLnMgKyBkYXRhLmMgKiByYXRpbyksIGRhdGEpO1xuICB9LFxuICAgICAgX3JlbmRlckNvbXBsZXhTdHJpbmcgPSBmdW5jdGlvbiBfcmVuZGVyQ29tcGxleFN0cmluZyhyYXRpbywgZGF0YSkge1xuICAgIHZhciBwdCA9IGRhdGEuX3B0LFxuICAgICAgICBzID0gXCJcIjtcblxuICAgIGlmICghcmF0aW8gJiYgZGF0YS5iKSB7XG4gICAgICBzID0gZGF0YS5iO1xuICAgIH0gZWxzZSBpZiAocmF0aW8gPT09IDEgJiYgZGF0YS5lKSB7XG4gICAgICBzID0gZGF0YS5lO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAocHQpIHtcbiAgICAgICAgcyA9IHB0LnAgKyAocHQubSA/IHB0Lm0ocHQucyArIHB0LmMgKiByYXRpbykgOiBNYXRoLnJvdW5kKChwdC5zICsgcHQuYyAqIHJhdGlvKSAqIDEwMDAwKSAvIDEwMDAwKSArIHM7XG4gICAgICAgIHB0ID0gcHQuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHMgKz0gZGF0YS5jO1xuICAgIH1cblxuICAgIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCBzLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJQcm9wVHdlZW5zID0gZnVuY3Rpb24gX3JlbmRlclByb3BUd2VlbnMocmF0aW8sIGRhdGEpIHtcbiAgICB2YXIgcHQgPSBkYXRhLl9wdDtcblxuICAgIHdoaWxlIChwdCkge1xuICAgICAgcHQucihyYXRpbywgcHQuZCk7XG4gICAgICBwdCA9IHB0Ll9uZXh0O1xuICAgIH1cbiAgfSxcbiAgICAgIF9hZGRQbHVnaW5Nb2RpZmllciA9IGZ1bmN0aW9uIF9hZGRQbHVnaW5Nb2RpZmllcihtb2RpZmllciwgdHdlZW4sIHRhcmdldCwgcHJvcGVydHkpIHtcbiAgICB2YXIgcHQgPSB0aGlzLl9wdCxcbiAgICAgICAgbmV4dDtcblxuICAgIHdoaWxlIChwdCkge1xuICAgICAgbmV4dCA9IHB0Ll9uZXh0O1xuICAgICAgcHQucCA9PT0gcHJvcGVydHkgJiYgcHQubW9kaWZpZXIobW9kaWZpZXIsIHR3ZWVuLCB0YXJnZXQpO1xuICAgICAgcHQgPSBuZXh0O1xuICAgIH1cbiAgfSxcbiAgICAgIF9raWxsUHJvcFR3ZWVuc09mID0gZnVuY3Rpb24gX2tpbGxQcm9wVHdlZW5zT2YocHJvcGVydHkpIHtcbiAgICB2YXIgcHQgPSB0aGlzLl9wdCxcbiAgICAgICAgaGFzTm9uRGVwZW5kZW50UmVtYWluaW5nLFxuICAgICAgICBuZXh0O1xuXG4gICAgd2hpbGUgKHB0KSB7XG4gICAgICBuZXh0ID0gcHQuX25leHQ7XG5cbiAgICAgIGlmIChwdC5wID09PSBwcm9wZXJ0eSAmJiAhcHQub3AgfHwgcHQub3AgPT09IHByb3BlcnR5KSB7XG4gICAgICAgIF9yZW1vdmVMaW5rZWRMaXN0SXRlbSh0aGlzLCBwdCwgXCJfcHRcIik7XG4gICAgICB9IGVsc2UgaWYgKCFwdC5kZXApIHtcbiAgICAgICAgaGFzTm9uRGVwZW5kZW50UmVtYWluaW5nID0gMTtcbiAgICAgIH1cblxuICAgICAgcHQgPSBuZXh0O1xuICAgIH1cblxuICAgIHJldHVybiAhaGFzTm9uRGVwZW5kZW50UmVtYWluaW5nO1xuICB9LFxuICAgICAgX3NldHRlcldpdGhNb2RpZmllciA9IGZ1bmN0aW9uIF9zZXR0ZXJXaXRoTW9kaWZpZXIodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIGRhdGEpIHtcbiAgICBkYXRhLm1TZXQodGFyZ2V0LCBwcm9wZXJ0eSwgZGF0YS5tLmNhbGwoZGF0YS50d2VlbiwgdmFsdWUsIGRhdGEubXQpLCBkYXRhKTtcbiAgfSxcbiAgICAgIF9zb3J0UHJvcFR3ZWVuc0J5UHJpb3JpdHkgPSBmdW5jdGlvbiBfc29ydFByb3BUd2VlbnNCeVByaW9yaXR5KHBhcmVudCkge1xuICAgIHZhciBwdCA9IHBhcmVudC5fcHQsXG4gICAgICAgIG5leHQsXG4gICAgICAgIHB0MixcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGxhc3Q7XG5cbiAgICB3aGlsZSAocHQpIHtcbiAgICAgIG5leHQgPSBwdC5fbmV4dDtcbiAgICAgIHB0MiA9IGZpcnN0O1xuXG4gICAgICB3aGlsZSAocHQyICYmIHB0Mi5wciA+IHB0LnByKSB7XG4gICAgICAgIHB0MiA9IHB0Mi5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgaWYgKHB0Ll9wcmV2ID0gcHQyID8gcHQyLl9wcmV2IDogbGFzdCkge1xuICAgICAgICBwdC5fcHJldi5fbmV4dCA9IHB0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlyc3QgPSBwdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHB0Ll9uZXh0ID0gcHQyKSB7XG4gICAgICAgIHB0Mi5fcHJldiA9IHB0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdCA9IHB0O1xuICAgICAgfVxuXG4gICAgICBwdCA9IG5leHQ7XG4gICAgfVxuXG4gICAgcGFyZW50Ll9wdCA9IGZpcnN0O1xuICB9O1xuXG4gIHZhciBQcm9wVHdlZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUHJvcFR3ZWVuKG5leHQsIHRhcmdldCwgcHJvcCwgc3RhcnQsIGNoYW5nZSwgcmVuZGVyZXIsIGRhdGEsIHNldHRlciwgcHJpb3JpdHkpIHtcbiAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICAgIHRoaXMucyA9IHN0YXJ0O1xuICAgICAgdGhpcy5jID0gY2hhbmdlO1xuICAgICAgdGhpcy5wID0gcHJvcDtcbiAgICAgIHRoaXMuciA9IHJlbmRlcmVyIHx8IF9yZW5kZXJQbGFpbjtcbiAgICAgIHRoaXMuZCA9IGRhdGEgfHwgdGhpcztcbiAgICAgIHRoaXMuc2V0ID0gc2V0dGVyIHx8IF9zZXR0ZXJQbGFpbjtcbiAgICAgIHRoaXMucHIgPSBwcmlvcml0eSB8fCAwO1xuICAgICAgdGhpcy5fbmV4dCA9IG5leHQ7XG5cbiAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgIG5leHQuX3ByZXYgPSB0aGlzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfcHJvdG80ID0gUHJvcFR3ZWVuLnByb3RvdHlwZTtcblxuICAgIF9wcm90bzQubW9kaWZpZXIgPSBmdW5jdGlvbiBtb2RpZmllcihmdW5jLCB0d2VlbiwgdGFyZ2V0KSB7XG4gICAgICB0aGlzLm1TZXQgPSB0aGlzLm1TZXQgfHwgdGhpcy5zZXQ7XG4gICAgICB0aGlzLnNldCA9IF9zZXR0ZXJXaXRoTW9kaWZpZXI7XG4gICAgICB0aGlzLm0gPSBmdW5jO1xuICAgICAgdGhpcy5tdCA9IHRhcmdldDtcbiAgICAgIHRoaXMudHdlZW4gPSB0d2VlbjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFByb3BUd2VlbjtcbiAgfSgpO1xuXG4gIF9mb3JFYWNoTmFtZShfY2FsbGJhY2tOYW1lcyArIFwicGFyZW50LGR1cmF0aW9uLGVhc2UsZGVsYXksb3ZlcndyaXRlLHJ1bkJhY2t3YXJkcyxzdGFydEF0LHlveW8saW1tZWRpYXRlUmVuZGVyLHJlcGVhdCxyZXBlYXREZWxheSxkYXRhLHBhdXNlZCxyZXZlcnNlZCxsYXp5LGNhbGxiYWNrU2NvcGUsc3RyaW5nRmlsdGVyLGlkLHlveW9FYXNlLHN0YWdnZXIsaW5oZXJpdCxyZXBlYXRSZWZyZXNoLGtleWZyYW1lcyxhdXRvUmV2ZXJ0LHNjcm9sbFRyaWdnZXJcIiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gX3Jlc2VydmVkUHJvcHNbbmFtZV0gPSAxO1xuICB9KTtcblxuICBfZ2xvYmFscy5Ud2Vlbk1heCA9IF9nbG9iYWxzLlR3ZWVuTGl0ZSA9IFR3ZWVuO1xuICBfZ2xvYmFscy5UaW1lbGluZUxpdGUgPSBfZ2xvYmFscy5UaW1lbGluZU1heCA9IFRpbWVsaW5lO1xuICBfZ2xvYmFsVGltZWxpbmUgPSBuZXcgVGltZWxpbmUoe1xuICAgIHNvcnRDaGlsZHJlbjogZmFsc2UsXG4gICAgZGVmYXVsdHM6IF9kZWZhdWx0cyxcbiAgICBhdXRvUmVtb3ZlQ2hpbGRyZW46IHRydWUsXG4gICAgaWQ6IFwicm9vdFwiLFxuICAgIHNtb290aENoaWxkVGltaW5nOiB0cnVlXG4gIH0pO1xuICBfY29uZmlnLnN0cmluZ0ZpbHRlciA9IF9jb2xvclN0cmluZ0ZpbHRlcjtcbiAgdmFyIF9nc2FwID0ge1xuICAgIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiByZWdpc3RlclBsdWdpbigpIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICBhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgIHJldHVybiBfY3JlYXRlUGx1Z2luKGNvbmZpZyk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRpbWVsaW5lOiBmdW5jdGlvbiB0aW1lbGluZSh2YXJzKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWVsaW5lKHZhcnMpO1xuICAgIH0sXG4gICAgZ2V0VHdlZW5zT2Y6IGZ1bmN0aW9uIGdldFR3ZWVuc09mKHRhcmdldHMsIG9ubHlBY3RpdmUpIHtcbiAgICAgIHJldHVybiBfZ2xvYmFsVGltZWxpbmUuZ2V0VHdlZW5zT2YodGFyZ2V0cywgb25seUFjdGl2ZSk7XG4gICAgfSxcbiAgICBnZXRQcm9wZXJ0eTogZnVuY3Rpb24gZ2V0UHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwgdW5pdCwgdW5jYWNoZSkge1xuICAgICAgX2lzU3RyaW5nKHRhcmdldCkgJiYgKHRhcmdldCA9IHRvQXJyYXkodGFyZ2V0KVswXSk7XG5cbiAgICAgIHZhciBnZXR0ZXIgPSBfZ2V0Q2FjaGUodGFyZ2V0IHx8IHt9KS5nZXQsXG4gICAgICAgICAgZm9ybWF0ID0gdW5pdCA/IF9wYXNzVGhyb3VnaCA6IF9udW1lcmljSWZQb3NzaWJsZTtcblxuICAgICAgdW5pdCA9PT0gXCJuYXRpdmVcIiAmJiAodW5pdCA9IFwiXCIpO1xuICAgICAgcmV0dXJuICF0YXJnZXQgPyB0YXJnZXQgOiAhcHJvcGVydHkgPyBmdW5jdGlvbiAocHJvcGVydHksIHVuaXQsIHVuY2FjaGUpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdCgoX3BsdWdpbnNbcHJvcGVydHldICYmIF9wbHVnaW5zW3Byb3BlcnR5XS5nZXQgfHwgZ2V0dGVyKSh0YXJnZXQsIHByb3BlcnR5LCB1bml0LCB1bmNhY2hlKSk7XG4gICAgICB9IDogZm9ybWF0KChfcGx1Z2luc1twcm9wZXJ0eV0gJiYgX3BsdWdpbnNbcHJvcGVydHldLmdldCB8fCBnZXR0ZXIpKHRhcmdldCwgcHJvcGVydHksIHVuaXQsIHVuY2FjaGUpKTtcbiAgICB9LFxuICAgIHF1aWNrU2V0dGVyOiBmdW5jdGlvbiBxdWlja1NldHRlcih0YXJnZXQsIHByb3BlcnR5LCB1bml0KSB7XG4gICAgICB0YXJnZXQgPSB0b0FycmF5KHRhcmdldCk7XG5cbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgc2V0dGVycyA9IHRhcmdldC5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICByZXR1cm4gZ3NhcC5xdWlja1NldHRlcih0LCBwcm9wZXJ0eSwgdW5pdCk7XG4gICAgICAgIH0pLFxuICAgICAgICAgICAgbCA9IHNldHRlcnMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIGkgPSBsO1xuXG4gICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgc2V0dGVyc1tpXSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0YXJnZXQgPSB0YXJnZXRbMF0gfHwge307XG5cbiAgICAgIHZhciBQbHVnaW4gPSBfcGx1Z2luc1twcm9wZXJ0eV0sXG4gICAgICAgICAgY2FjaGUgPSBfZ2V0Q2FjaGUodGFyZ2V0KSxcbiAgICAgICAgICBwID0gY2FjaGUuaGFybmVzcyAmJiAoY2FjaGUuaGFybmVzcy5hbGlhc2VzIHx8IHt9KVtwcm9wZXJ0eV0gfHwgcHJvcGVydHksXG4gICAgICAgICAgc2V0dGVyID0gUGx1Z2luID8gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBwID0gbmV3IFBsdWdpbigpO1xuICAgICAgICBfcXVpY2tUd2Vlbi5fcHQgPSAwO1xuICAgICAgICBwLmluaXQodGFyZ2V0LCB1bml0ID8gdmFsdWUgKyB1bml0IDogdmFsdWUsIF9xdWlja1R3ZWVuLCAwLCBbdGFyZ2V0XSk7XG4gICAgICAgIHAucmVuZGVyKDEsIHApO1xuICAgICAgICBfcXVpY2tUd2Vlbi5fcHQgJiYgX3JlbmRlclByb3BUd2VlbnMoMSwgX3F1aWNrVHdlZW4pO1xuICAgICAgfSA6IGNhY2hlLnNldCh0YXJnZXQsIHApO1xuXG4gICAgICByZXR1cm4gUGx1Z2luID8gc2V0dGVyIDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBzZXR0ZXIodGFyZ2V0LCBwLCB1bml0ID8gdmFsdWUgKyB1bml0IDogdmFsdWUsIGNhY2hlLCAxKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBpc1R3ZWVuaW5nOiBmdW5jdGlvbiBpc1R3ZWVuaW5nKHRhcmdldHMpIHtcbiAgICAgIHJldHVybiBfZ2xvYmFsVGltZWxpbmUuZ2V0VHdlZW5zT2YodGFyZ2V0cywgdHJ1ZSkubGVuZ3RoID4gMDtcbiAgICB9LFxuICAgIGRlZmF1bHRzOiBmdW5jdGlvbiBkZWZhdWx0cyh2YWx1ZSkge1xuICAgICAgdmFsdWUgJiYgdmFsdWUuZWFzZSAmJiAodmFsdWUuZWFzZSA9IF9wYXJzZUVhc2UodmFsdWUuZWFzZSwgX2RlZmF1bHRzLmVhc2UpKTtcbiAgICAgIHJldHVybiBfbWVyZ2VEZWVwKF9kZWZhdWx0cywgdmFsdWUgfHwge30pO1xuICAgIH0sXG4gICAgY29uZmlnOiBmdW5jdGlvbiBjb25maWcodmFsdWUpIHtcbiAgICAgIHJldHVybiBfbWVyZ2VEZWVwKF9jb25maWcsIHZhbHVlIHx8IHt9KTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyRWZmZWN0OiBmdW5jdGlvbiByZWdpc3RlckVmZmVjdChfcmVmMykge1xuICAgICAgdmFyIG5hbWUgPSBfcmVmMy5uYW1lLFxuICAgICAgICAgIGVmZmVjdCA9IF9yZWYzLmVmZmVjdCxcbiAgICAgICAgICBwbHVnaW5zID0gX3JlZjMucGx1Z2lucyxcbiAgICAgICAgICBkZWZhdWx0cyA9IF9yZWYzLmRlZmF1bHRzLFxuICAgICAgICAgIGV4dGVuZFRpbWVsaW5lID0gX3JlZjMuZXh0ZW5kVGltZWxpbmU7XG4gICAgICAocGx1Z2lucyB8fCBcIlwiKS5zcGxpdChcIixcIikuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luTmFtZSkge1xuICAgICAgICByZXR1cm4gcGx1Z2luTmFtZSAmJiAhX3BsdWdpbnNbcGx1Z2luTmFtZV0gJiYgIV9nbG9iYWxzW3BsdWdpbk5hbWVdICYmIF93YXJuKG5hbWUgKyBcIiBlZmZlY3QgcmVxdWlyZXMgXCIgKyBwbHVnaW5OYW1lICsgXCIgcGx1Z2luLlwiKTtcbiAgICAgIH0pO1xuXG4gICAgICBfZWZmZWN0c1tuYW1lXSA9IGZ1bmN0aW9uICh0YXJnZXRzLCB2YXJzLCB0bCkge1xuICAgICAgICByZXR1cm4gZWZmZWN0KHRvQXJyYXkodGFyZ2V0cyksIF9zZXREZWZhdWx0cyh2YXJzIHx8IHt9LCBkZWZhdWx0cyksIHRsKTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChleHRlbmRUaW1lbGluZSkge1xuICAgICAgICBUaW1lbGluZS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAodGFyZ2V0cywgdmFycywgcG9zaXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoX2VmZmVjdHNbbmFtZV0odGFyZ2V0cywgX2lzT2JqZWN0KHZhcnMpID8gdmFycyA6IChwb3NpdGlvbiA9IHZhcnMpICYmIHt9LCB0aGlzKSwgcG9zaXRpb24pO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXJFYXNlOiBmdW5jdGlvbiByZWdpc3RlckVhc2UobmFtZSwgZWFzZSkge1xuICAgICAgX2Vhc2VNYXBbbmFtZV0gPSBfcGFyc2VFYXNlKGVhc2UpO1xuICAgIH0sXG4gICAgcGFyc2VFYXNlOiBmdW5jdGlvbiBwYXJzZUVhc2UoZWFzZSwgZGVmYXVsdEVhc2UpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gX3BhcnNlRWFzZShlYXNlLCBkZWZhdWx0RWFzZSkgOiBfZWFzZU1hcDtcbiAgICB9LFxuICAgIGdldEJ5SWQ6IGZ1bmN0aW9uIGdldEJ5SWQoaWQpIHtcbiAgICAgIHJldHVybiBfZ2xvYmFsVGltZWxpbmUuZ2V0QnlJZChpZCk7XG4gICAgfSxcbiAgICBleHBvcnRSb290OiBmdW5jdGlvbiBleHBvcnRSb290KHZhcnMsIGluY2x1ZGVEZWxheWVkQ2FsbHMpIHtcbiAgICAgIGlmICh2YXJzID09PSB2b2lkIDApIHtcbiAgICAgICAgdmFycyA9IHt9O1xuICAgICAgfVxuXG4gICAgICB2YXIgdGwgPSBuZXcgVGltZWxpbmUodmFycyksXG4gICAgICAgICAgY2hpbGQsXG4gICAgICAgICAgbmV4dDtcbiAgICAgIHRsLnNtb290aENoaWxkVGltaW5nID0gX2lzTm90RmFsc2UodmFycy5zbW9vdGhDaGlsZFRpbWluZyk7XG5cbiAgICAgIF9nbG9iYWxUaW1lbGluZS5yZW1vdmUodGwpO1xuXG4gICAgICB0bC5fZHAgPSAwO1xuICAgICAgdGwuX3RpbWUgPSB0bC5fdFRpbWUgPSBfZ2xvYmFsVGltZWxpbmUuX3RpbWU7XG4gICAgICBjaGlsZCA9IF9nbG9iYWxUaW1lbGluZS5fZmlyc3Q7XG5cbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBuZXh0ID0gY2hpbGQuX25leHQ7XG5cbiAgICAgICAgaWYgKGluY2x1ZGVEZWxheWVkQ2FsbHMgfHwgISghY2hpbGQuX2R1ciAmJiBjaGlsZCBpbnN0YW5jZW9mIFR3ZWVuICYmIGNoaWxkLnZhcnMub25Db21wbGV0ZSA9PT0gY2hpbGQuX3RhcmdldHNbMF0pKSB7XG4gICAgICAgICAgX2FkZFRvVGltZWxpbmUodGwsIGNoaWxkLCBjaGlsZC5fc3RhcnQgLSBjaGlsZC5fZGVsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICBfYWRkVG9UaW1lbGluZShfZ2xvYmFsVGltZWxpbmUsIHRsLCAwKTtcblxuICAgICAgcmV0dXJuIHRsO1xuICAgIH0sXG4gICAgdXRpbHM6IHtcbiAgICAgIHdyYXA6IHdyYXAsXG4gICAgICB3cmFwWW95bzogd3JhcFlveW8sXG4gICAgICBkaXN0cmlidXRlOiBkaXN0cmlidXRlLFxuICAgICAgcmFuZG9tOiByYW5kb20sXG4gICAgICBzbmFwOiBzbmFwLFxuICAgICAgbm9ybWFsaXplOiBub3JtYWxpemUsXG4gICAgICBnZXRVbml0OiBnZXRVbml0LFxuICAgICAgY2xhbXA6IGNsYW1wLFxuICAgICAgc3BsaXRDb2xvcjogc3BsaXRDb2xvcixcbiAgICAgIHRvQXJyYXk6IHRvQXJyYXksXG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBtYXBSYW5nZTogbWFwUmFuZ2UsXG4gICAgICBwaXBlOiBwaXBlLFxuICAgICAgdW5pdGl6ZTogdW5pdGl6ZSxcbiAgICAgIGludGVycG9sYXRlOiBpbnRlcnBvbGF0ZSxcbiAgICAgIHNodWZmbGU6IHNodWZmbGVcbiAgICB9LFxuICAgIGluc3RhbGw6IF9pbnN0YWxsLFxuICAgIGVmZmVjdHM6IF9lZmZlY3RzLFxuICAgIHRpY2tlcjogX3RpY2tlcixcbiAgICB1cGRhdGVSb290OiBUaW1lbGluZS51cGRhdGVSb290LFxuICAgIHBsdWdpbnM6IF9wbHVnaW5zLFxuICAgIGdsb2JhbFRpbWVsaW5lOiBfZ2xvYmFsVGltZWxpbmUsXG4gICAgY29yZToge1xuICAgICAgUHJvcFR3ZWVuOiBQcm9wVHdlZW4sXG4gICAgICBnbG9iYWxzOiBfYWRkR2xvYmFsLFxuICAgICAgVHdlZW46IFR3ZWVuLFxuICAgICAgVGltZWxpbmU6IFRpbWVsaW5lLFxuICAgICAgQW5pbWF0aW9uOiBBbmltYXRpb24sXG4gICAgICBnZXRDYWNoZTogX2dldENhY2hlLFxuICAgICAgX3JlbW92ZUxpbmtlZExpc3RJdGVtOiBfcmVtb3ZlTGlua2VkTGlzdEl0ZW0sXG4gICAgICBzdXBwcmVzc092ZXJ3cml0ZXM6IGZ1bmN0aW9uIHN1cHByZXNzT3ZlcndyaXRlcyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX3N1cHByZXNzT3ZlcndyaXRlcyA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfZm9yRWFjaE5hbWUoXCJ0byxmcm9tLGZyb21UbyxkZWxheWVkQ2FsbCxzZXQsa2lsbFR3ZWVuc09mXCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIF9nc2FwW25hbWVdID0gVHdlZW5bbmFtZV07XG4gIH0pO1xuXG4gIF90aWNrZXIuYWRkKFRpbWVsaW5lLnVwZGF0ZVJvb3QpO1xuXG4gIF9xdWlja1R3ZWVuID0gX2dzYXAudG8oe30sIHtcbiAgICBkdXJhdGlvbjogMFxuICB9KTtcblxuICB2YXIgX2dldFBsdWdpblByb3BUd2VlbiA9IGZ1bmN0aW9uIF9nZXRQbHVnaW5Qcm9wVHdlZW4ocGx1Z2luLCBwcm9wKSB7XG4gICAgdmFyIHB0ID0gcGx1Z2luLl9wdDtcblxuICAgIHdoaWxlIChwdCAmJiBwdC5wICE9PSBwcm9wICYmIHB0Lm9wICE9PSBwcm9wICYmIHB0LmZwICE9PSBwcm9wKSB7XG4gICAgICBwdCA9IHB0Ll9uZXh0O1xuICAgIH1cblxuICAgIHJldHVybiBwdDtcbiAgfSxcbiAgICAgIF9hZGRNb2RpZmllcnMgPSBmdW5jdGlvbiBfYWRkTW9kaWZpZXJzKHR3ZWVuLCBtb2RpZmllcnMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHR3ZWVuLl90YXJnZXRzLFxuICAgICAgICBwLFxuICAgICAgICBpLFxuICAgICAgICBwdDtcblxuICAgIGZvciAocCBpbiBtb2RpZmllcnMpIHtcbiAgICAgIGkgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBwdCA9IHR3ZWVuLl9wdExvb2t1cFtpXVtwXTtcblxuICAgICAgICBpZiAocHQgJiYgKHB0ID0gcHQuZCkpIHtcbiAgICAgICAgICBpZiAocHQuX3B0KSB7XG4gICAgICAgICAgICBwdCA9IF9nZXRQbHVnaW5Qcm9wVHdlZW4ocHQsIHApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHB0ICYmIHB0Lm1vZGlmaWVyICYmIHB0Lm1vZGlmaWVyKG1vZGlmaWVyc1twXSwgdHdlZW4sIHRhcmdldHNbaV0sIHApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAgICAgX2J1aWxkTW9kaWZpZXJQbHVnaW4gPSBmdW5jdGlvbiBfYnVpbGRNb2RpZmllclBsdWdpbihuYW1lLCBtb2RpZmllcikge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgcmF3VmFyczogMSxcbiAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQodGFyZ2V0LCB2YXJzLCB0d2Vlbikge1xuICAgICAgICB0d2Vlbi5fb25Jbml0ID0gZnVuY3Rpb24gKHR3ZWVuKSB7XG4gICAgICAgICAgdmFyIHRlbXAsIHA7XG5cbiAgICAgICAgICBpZiAoX2lzU3RyaW5nKHZhcnMpKSB7XG4gICAgICAgICAgICB0ZW1wID0ge307XG5cbiAgICAgICAgICAgIF9mb3JFYWNoTmFtZSh2YXJzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdGVtcFtuYW1lXSA9IDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFycyA9IHRlbXA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICB0ZW1wID0ge307XG5cbiAgICAgICAgICAgIGZvciAocCBpbiB2YXJzKSB7XG4gICAgICAgICAgICAgIHRlbXBbcF0gPSBtb2RpZmllcih2YXJzW3BdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFycyA9IHRlbXA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX2FkZE1vZGlmaWVycyh0d2VlbiwgdmFycyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICB2YXIgZ3NhcCA9IF9nc2FwLnJlZ2lzdGVyUGx1Z2luKHtcbiAgICBuYW1lOiBcImF0dHJcIixcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHRhcmdldCwgdmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXRzKSB7XG4gICAgICB2YXIgcCwgcHQ7XG5cbiAgICAgIGZvciAocCBpbiB2YXJzKSB7XG4gICAgICAgIHB0ID0gdGhpcy5hZGQodGFyZ2V0LCBcInNldEF0dHJpYnV0ZVwiLCAodGFyZ2V0LmdldEF0dHJpYnV0ZShwKSB8fCAwKSArIFwiXCIsIHZhcnNbcF0sIGluZGV4LCB0YXJnZXRzLCAwLCAwLCBwKTtcbiAgICAgICAgcHQgJiYgKHB0Lm9wID0gcCk7XG5cbiAgICAgICAgdGhpcy5fcHJvcHMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBuYW1lOiBcImVuZEFycmF5XCIsXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCh0YXJnZXQsIHZhbHVlKSB7XG4gICAgICB2YXIgaSA9IHZhbHVlLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB0aGlzLmFkZCh0YXJnZXQsIGksIHRhcmdldFtpXSB8fCAwLCB2YWx1ZVtpXSk7XG4gICAgICB9XG4gICAgfVxuICB9LCBfYnVpbGRNb2RpZmllclBsdWdpbihcInJvdW5kUHJvcHNcIiwgX3JvdW5kTW9kaWZpZXIpLCBfYnVpbGRNb2RpZmllclBsdWdpbihcIm1vZGlmaWVyc1wiKSwgX2J1aWxkTW9kaWZpZXJQbHVnaW4oXCJzbmFwXCIsIHNuYXApKSB8fCBfZ3NhcDtcbiAgVHdlZW4udmVyc2lvbiA9IFRpbWVsaW5lLnZlcnNpb24gPSBnc2FwLnZlcnNpb24gPSBcIjMuOS4xXCI7XG4gIF9jb3JlUmVhZHkgPSAxO1xuICBfd2luZG93RXhpc3RzKCkgJiYgX3dha2UoKTtcbiAgdmFyIFBvd2VyMCA9IF9lYXNlTWFwLlBvd2VyMCxcbiAgICAgIFBvd2VyMSA9IF9lYXNlTWFwLlBvd2VyMSxcbiAgICAgIFBvd2VyMiA9IF9lYXNlTWFwLlBvd2VyMixcbiAgICAgIFBvd2VyMyA9IF9lYXNlTWFwLlBvd2VyMyxcbiAgICAgIFBvd2VyNCA9IF9lYXNlTWFwLlBvd2VyNCxcbiAgICAgIExpbmVhciA9IF9lYXNlTWFwLkxpbmVhcixcbiAgICAgIFF1YWQgPSBfZWFzZU1hcC5RdWFkLFxuICAgICAgQ3ViaWMgPSBfZWFzZU1hcC5DdWJpYyxcbiAgICAgIFF1YXJ0ID0gX2Vhc2VNYXAuUXVhcnQsXG4gICAgICBRdWludCA9IF9lYXNlTWFwLlF1aW50LFxuICAgICAgU3Ryb25nID0gX2Vhc2VNYXAuU3Ryb25nLFxuICAgICAgRWxhc3RpYyA9IF9lYXNlTWFwLkVsYXN0aWMsXG4gICAgICBCYWNrID0gX2Vhc2VNYXAuQmFjayxcbiAgICAgIFN0ZXBwZWRFYXNlID0gX2Vhc2VNYXAuU3RlcHBlZEVhc2UsXG4gICAgICBCb3VuY2UgPSBfZWFzZU1hcC5Cb3VuY2UsXG4gICAgICBTaW5lID0gX2Vhc2VNYXAuU2luZSxcbiAgICAgIEV4cG8gPSBfZWFzZU1hcC5FeHBvLFxuICAgICAgQ2lyYyA9IF9lYXNlTWFwLkNpcmM7XG5cbiAgdmFyIF93aW4kMSxcbiAgICAgIF9kb2MkMSxcbiAgICAgIF9kb2NFbGVtZW50LFxuICAgICAgX3BsdWdpbkluaXR0ZWQsXG4gICAgICBfdGVtcERpdixcbiAgICAgIF90ZW1wRGl2U3R5bGVyLFxuICAgICAgX3JlY2VudFNldHRlclBsdWdpbixcbiAgICAgIF93aW5kb3dFeGlzdHMkMSA9IGZ1bmN0aW9uIF93aW5kb3dFeGlzdHMoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI7XG4gIH0sXG4gICAgICBfdHJhbnNmb3JtUHJvcHMgPSB7fSxcbiAgICAgIF9SQUQyREVHID0gMTgwIC8gTWF0aC5QSSxcbiAgICAgIF9ERUcyUkFEID0gTWF0aC5QSSAvIDE4MCxcbiAgICAgIF9hdGFuMiA9IE1hdGguYXRhbjIsXG4gICAgICBfYmlnTnVtJDEgPSAxZTgsXG4gICAgICBfY2Fwc0V4cCA9IC8oW0EtWl0pL2csXG4gICAgICBfaG9yaXpvbnRhbEV4cCA9IC8oPzpsZWZ0fHJpZ2h0fHdpZHRofG1hcmdpbnxwYWRkaW5nfHgpL2ksXG4gICAgICBfY29tcGxleEV4cCA9IC9bXFxzLFxcKF1cXFMvLFxuICAgICAgX3Byb3BlcnR5QWxpYXNlcyA9IHtcbiAgICBhdXRvQWxwaGE6IFwib3BhY2l0eSx2aXNpYmlsaXR5XCIsXG4gICAgc2NhbGU6IFwic2NhbGVYLHNjYWxlWVwiLFxuICAgIGFscGhhOiBcIm9wYWNpdHlcIlxuICB9LFxuICAgICAgX3JlbmRlckNTU1Byb3AgPSBmdW5jdGlvbiBfcmVuZGVyQ1NTUHJvcChyYXRpbywgZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnNldChkYXRhLnQsIGRhdGEucCwgTWF0aC5yb3VuZCgoZGF0YS5zICsgZGF0YS5jICogcmF0aW8pICogMTAwMDApIC8gMTAwMDAgKyBkYXRhLnUsIGRhdGEpO1xuICB9LFxuICAgICAgX3JlbmRlclByb3BXaXRoRW5kID0gZnVuY3Rpb24gX3JlbmRlclByb3BXaXRoRW5kKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCByYXRpbyA9PT0gMSA/IGRhdGEuZSA6IE1hdGgucm91bmQoKGRhdGEucyArIGRhdGEuYyAqIHJhdGlvKSAqIDEwMDAwKSAvIDEwMDAwICsgZGF0YS51LCBkYXRhKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJDU1NQcm9wV2l0aEJlZ2lubmluZyA9IGZ1bmN0aW9uIF9yZW5kZXJDU1NQcm9wV2l0aEJlZ2lubmluZyhyYXRpbywgZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnNldChkYXRhLnQsIGRhdGEucCwgcmF0aW8gPyBNYXRoLnJvdW5kKChkYXRhLnMgKyBkYXRhLmMgKiByYXRpbykgKiAxMDAwMCkgLyAxMDAwMCArIGRhdGEudSA6IGRhdGEuYiwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyUm91bmRlZENTU1Byb3AgPSBmdW5jdGlvbiBfcmVuZGVyUm91bmRlZENTU1Byb3AocmF0aW8sIGRhdGEpIHtcbiAgICB2YXIgdmFsdWUgPSBkYXRhLnMgKyBkYXRhLmMgKiByYXRpbztcbiAgICBkYXRhLnNldChkYXRhLnQsIGRhdGEucCwgfn4odmFsdWUgKyAodmFsdWUgPCAwID8gLS41IDogLjUpKSArIGRhdGEudSwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZSA9IGZ1bmN0aW9uIF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCByYXRpbyA/IGRhdGEuZSA6IGRhdGEuYiwgZGF0YSk7XG4gIH0sXG4gICAgICBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZU9ubHlBdEVuZCA9IGZ1bmN0aW9uIF9yZW5kZXJOb25Ud2VlbmluZ1ZhbHVlT25seUF0RW5kKHJhdGlvLCBkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc2V0KGRhdGEudCwgZGF0YS5wLCByYXRpbyAhPT0gMSA/IGRhdGEuYiA6IGRhdGEuZSwgZGF0YSk7XG4gIH0sXG4gICAgICBfc2V0dGVyQ1NTU3R5bGUgPSBmdW5jdGlvbiBfc2V0dGVyQ1NTU3R5bGUodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGFyZ2V0LnN0eWxlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICB9LFxuICAgICAgX3NldHRlckNTU1Byb3AgPSBmdW5jdGlvbiBfc2V0dGVyQ1NTUHJvcCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXQuc3R5bGUuc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgfSxcbiAgICAgIF9zZXR0ZXJUcmFuc2Zvcm0gPSBmdW5jdGlvbiBfc2V0dGVyVHJhbnNmb3JtKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldC5fZ3NhcFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgfSxcbiAgICAgIF9zZXR0ZXJTY2FsZSA9IGZ1bmN0aW9uIF9zZXR0ZXJTY2FsZSh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXQuX2dzYXAuc2NhbGVYID0gdGFyZ2V0Ll9nc2FwLnNjYWxlWSA9IHZhbHVlO1xuICB9LFxuICAgICAgX3NldHRlclNjYWxlV2l0aFJlbmRlciA9IGZ1bmN0aW9uIF9zZXR0ZXJTY2FsZVdpdGhSZW5kZXIodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIGRhdGEsIHJhdGlvKSB7XG4gICAgdmFyIGNhY2hlID0gdGFyZ2V0Ll9nc2FwO1xuICAgIGNhY2hlLnNjYWxlWCA9IGNhY2hlLnNjYWxlWSA9IHZhbHVlO1xuICAgIGNhY2hlLnJlbmRlclRyYW5zZm9ybShyYXRpbywgY2FjaGUpO1xuICB9LFxuICAgICAgX3NldHRlclRyYW5zZm9ybVdpdGhSZW5kZXIgPSBmdW5jdGlvbiBfc2V0dGVyVHJhbnNmb3JtV2l0aFJlbmRlcih0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgZGF0YSwgcmF0aW8pIHtcbiAgICB2YXIgY2FjaGUgPSB0YXJnZXQuX2dzYXA7XG4gICAgY2FjaGVbcHJvcGVydHldID0gdmFsdWU7XG4gICAgY2FjaGUucmVuZGVyVHJhbnNmb3JtKHJhdGlvLCBjYWNoZSk7XG4gIH0sXG4gICAgICBfdHJhbnNmb3JtUHJvcCA9IFwidHJhbnNmb3JtXCIsXG4gICAgICBfdHJhbnNmb3JtT3JpZ2luUHJvcCA9IF90cmFuc2Zvcm1Qcm9wICsgXCJPcmlnaW5cIixcbiAgICAgIF9zdXBwb3J0czNELFxuICAgICAgX2NyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiBfY3JlYXRlRWxlbWVudCh0eXBlLCBucykge1xuICAgIHZhciBlID0gX2RvYyQxLmNyZWF0ZUVsZW1lbnROUyA/IF9kb2MkMS5jcmVhdGVFbGVtZW50TlMoKG5zIHx8IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiKS5yZXBsYWNlKC9eaHR0cHMvLCBcImh0dHBcIiksIHR5cGUpIDogX2RvYyQxLmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gICAgcmV0dXJuIGUuc3R5bGUgPyBlIDogX2RvYyQxLmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gIH0sXG4gICAgICBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSA9IGZ1bmN0aW9uIF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIHNraXBQcmVmaXhGYWxsYmFjaykge1xuICAgIHZhciBjcyA9IGdldENvbXB1dGVkU3R5bGUodGFyZ2V0KTtcbiAgICByZXR1cm4gY3NbcHJvcGVydHldIHx8IGNzLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkucmVwbGFjZShfY2Fwc0V4cCwgXCItJDFcIikudG9Mb3dlckNhc2UoKSkgfHwgY3MuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSkgfHwgIXNraXBQcmVmaXhGYWxsYmFjayAmJiBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIF9jaGVja1Byb3BQcmVmaXgocHJvcGVydHkpIHx8IHByb3BlcnR5LCAxKSB8fCBcIlwiO1xuICB9LFxuICAgICAgX3ByZWZpeGVzID0gXCJPLE1veixtcyxNcyxXZWJraXRcIi5zcGxpdChcIixcIiksXG4gICAgICBfY2hlY2tQcm9wUHJlZml4ID0gZnVuY3Rpb24gX2NoZWNrUHJvcFByZWZpeChwcm9wZXJ0eSwgZWxlbWVudCwgcHJlZmVyUHJlZml4KSB7XG4gICAgdmFyIGUgPSBlbGVtZW50IHx8IF90ZW1wRGl2LFxuICAgICAgICBzID0gZS5zdHlsZSxcbiAgICAgICAgaSA9IDU7XG5cbiAgICBpZiAocHJvcGVydHkgaW4gcyAmJiAhcHJlZmVyUHJlZml4KSB7XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3BlcnR5LnN1YnN0cigxKTtcblxuICAgIHdoaWxlIChpLS0gJiYgIShfcHJlZml4ZXNbaV0gKyBwcm9wZXJ0eSBpbiBzKSkge31cblxuICAgIHJldHVybiBpIDwgMCA/IG51bGwgOiAoaSA9PT0gMyA/IFwibXNcIiA6IGkgPj0gMCA/IF9wcmVmaXhlc1tpXSA6IFwiXCIpICsgcHJvcGVydHk7XG4gIH0sXG4gICAgICBfaW5pdENvcmUgPSBmdW5jdGlvbiBfaW5pdENvcmUoKSB7XG4gICAgaWYgKF93aW5kb3dFeGlzdHMkMSgpICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgICAgX3dpbiQxID0gd2luZG93O1xuICAgICAgX2RvYyQxID0gX3dpbiQxLmRvY3VtZW50O1xuICAgICAgX2RvY0VsZW1lbnQgPSBfZG9jJDEuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgX3RlbXBEaXYgPSBfY3JlYXRlRWxlbWVudChcImRpdlwiKSB8fCB7XG4gICAgICAgIHN0eWxlOiB7fVxuICAgICAgfTtcbiAgICAgIF90ZW1wRGl2U3R5bGVyID0gX2NyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBfdHJhbnNmb3JtUHJvcCA9IF9jaGVja1Byb3BQcmVmaXgoX3RyYW5zZm9ybVByb3ApO1xuICAgICAgX3RyYW5zZm9ybU9yaWdpblByb3AgPSBfdHJhbnNmb3JtUHJvcCArIFwiT3JpZ2luXCI7XG4gICAgICBfdGVtcERpdi5zdHlsZS5jc3NUZXh0ID0gXCJib3JkZXItd2lkdGg6MDtsaW5lLWhlaWdodDowO3Bvc2l0aW9uOmFic29sdXRlO3BhZGRpbmc6MFwiO1xuICAgICAgX3N1cHBvcnRzM0QgPSAhIV9jaGVja1Byb3BQcmVmaXgoXCJwZXJzcGVjdGl2ZVwiKTtcbiAgICAgIF9wbHVnaW5Jbml0dGVkID0gMTtcbiAgICB9XG4gIH0sXG4gICAgICBfZ2V0QkJveEhhY2sgPSBmdW5jdGlvbiBfZ2V0QkJveEhhY2soc3dhcElmUG9zc2libGUpIHtcbiAgICB2YXIgc3ZnID0gX2NyZWF0ZUVsZW1lbnQoXCJzdmdcIiwgdGhpcy5vd25lclNWR0VsZW1lbnQgJiYgdGhpcy5vd25lclNWR0VsZW1lbnQuZ2V0QXR0cmlidXRlKFwieG1sbnNcIikgfHwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSxcbiAgICAgICAgb2xkUGFyZW50ID0gdGhpcy5wYXJlbnROb2RlLFxuICAgICAgICBvbGRTaWJsaW5nID0gdGhpcy5uZXh0U2libGluZyxcbiAgICAgICAgb2xkQ1NTID0gdGhpcy5zdHlsZS5jc3NUZXh0LFxuICAgICAgICBiYm94O1xuXG4gICAgX2RvY0VsZW1lbnQuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuICAgIHN2Zy5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cbiAgICBpZiAoc3dhcElmUG9zc2libGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJib3ggPSB0aGlzLmdldEJCb3goKTtcbiAgICAgICAgdGhpcy5fZ3NhcEJCb3ggPSB0aGlzLmdldEJCb3g7XG4gICAgICAgIHRoaXMuZ2V0QkJveCA9IF9nZXRCQm94SGFjaztcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9nc2FwQkJveCkge1xuICAgICAgYmJveCA9IHRoaXMuX2dzYXBCQm94KCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFBhcmVudCkge1xuICAgICAgaWYgKG9sZFNpYmxpbmcpIHtcbiAgICAgICAgb2xkUGFyZW50Lmluc2VydEJlZm9yZSh0aGlzLCBvbGRTaWJsaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZFBhcmVudC5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZG9jRWxlbWVudC5yZW1vdmVDaGlsZChzdmcpO1xuXG4gICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gb2xkQ1NTO1xuICAgIHJldHVybiBiYm94O1xuICB9LFxuICAgICAgX2dldEF0dHJpYnV0ZUZhbGxiYWNrcyA9IGZ1bmN0aW9uIF9nZXRBdHRyaWJ1dGVGYWxsYmFja3ModGFyZ2V0LCBhdHRyaWJ1dGVzQXJyYXkpIHtcbiAgICB2YXIgaSA9IGF0dHJpYnV0ZXNBcnJheS5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVzQXJyYXlbaV0pKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZXNBcnJheVtpXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAgICAgX2dldEJCb3ggPSBmdW5jdGlvbiBfZ2V0QkJveCh0YXJnZXQpIHtcbiAgICB2YXIgYm91bmRzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGJvdW5kcyA9IHRhcmdldC5nZXRCQm94KCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGJvdW5kcyA9IF9nZXRCQm94SGFjay5jYWxsKHRhcmdldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgYm91bmRzICYmIChib3VuZHMud2lkdGggfHwgYm91bmRzLmhlaWdodCkgfHwgdGFyZ2V0LmdldEJCb3ggPT09IF9nZXRCQm94SGFjayB8fCAoYm91bmRzID0gX2dldEJCb3hIYWNrLmNhbGwodGFyZ2V0LCB0cnVlKSk7XG4gICAgcmV0dXJuIGJvdW5kcyAmJiAhYm91bmRzLndpZHRoICYmICFib3VuZHMueCAmJiAhYm91bmRzLnkgPyB7XG4gICAgICB4OiArX2dldEF0dHJpYnV0ZUZhbGxiYWNrcyh0YXJnZXQsIFtcInhcIiwgXCJjeFwiLCBcIngxXCJdKSB8fCAwLFxuICAgICAgeTogK19nZXRBdHRyaWJ1dGVGYWxsYmFja3ModGFyZ2V0LCBbXCJ5XCIsIFwiY3lcIiwgXCJ5MVwiXSkgfHwgMCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfSA6IGJvdW5kcztcbiAgfSxcbiAgICAgIF9pc1NWRyA9IGZ1bmN0aW9uIF9pc1NWRyhlKSB7XG4gICAgcmV0dXJuICEhKGUuZ2V0Q1RNICYmICghZS5wYXJlbnROb2RlIHx8IGUub3duZXJTVkdFbGVtZW50KSAmJiBfZ2V0QkJveChlKSk7XG4gIH0sXG4gICAgICBfcmVtb3ZlUHJvcGVydHkgPSBmdW5jdGlvbiBfcmVtb3ZlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChwcm9wZXJ0eSkge1xuICAgICAgdmFyIHN0eWxlID0gdGFyZ2V0LnN0eWxlO1xuXG4gICAgICBpZiAocHJvcGVydHkgaW4gX3RyYW5zZm9ybVByb3BzICYmIHByb3BlcnR5ICE9PSBfdHJhbnNmb3JtT3JpZ2luUHJvcCkge1xuICAgICAgICBwcm9wZXJ0eSA9IF90cmFuc2Zvcm1Qcm9wO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3R5bGUucmVtb3ZlUHJvcGVydHkpIHtcbiAgICAgICAgaWYgKHByb3BlcnR5LnN1YnN0cigwLCAyKSA9PT0gXCJtc1wiIHx8IHByb3BlcnR5LnN1YnN0cigwLCA2KSA9PT0gXCJ3ZWJraXRcIikge1xuICAgICAgICAgIHByb3BlcnR5ID0gXCItXCIgKyBwcm9wZXJ0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KHByb3BlcnR5LnJlcGxhY2UoX2NhcHNFeHAsIFwiLSQxXCIpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfYWRkTm9uVHdlZW5pbmdQVCA9IGZ1bmN0aW9uIF9hZGROb25Ud2VlbmluZ1BUKHBsdWdpbiwgdGFyZ2V0LCBwcm9wZXJ0eSwgYmVnaW5uaW5nLCBlbmQsIG9ubHlTZXRBdEVuZCkge1xuICAgIHZhciBwdCA9IG5ldyBQcm9wVHdlZW4ocGx1Z2luLl9wdCwgdGFyZ2V0LCBwcm9wZXJ0eSwgMCwgMSwgb25seVNldEF0RW5kID8gX3JlbmRlck5vblR3ZWVuaW5nVmFsdWVPbmx5QXRFbmQgOiBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZSk7XG4gICAgcGx1Z2luLl9wdCA9IHB0O1xuICAgIHB0LmIgPSBiZWdpbm5pbmc7XG4gICAgcHQuZSA9IGVuZDtcblxuICAgIHBsdWdpbi5fcHJvcHMucHVzaChwcm9wZXJ0eSk7XG5cbiAgICByZXR1cm4gcHQ7XG4gIH0sXG4gICAgICBfbm9uQ29udmVydGlibGVVbml0cyA9IHtcbiAgICBkZWc6IDEsXG4gICAgcmFkOiAxLFxuICAgIHR1cm46IDFcbiAgfSxcbiAgICAgIF9jb252ZXJ0VG9Vbml0ID0gZnVuY3Rpb24gX2NvbnZlcnRUb1VuaXQodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIHVuaXQpIHtcbiAgICB2YXIgY3VyVmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwLFxuICAgICAgICBjdXJVbml0ID0gKHZhbHVlICsgXCJcIikudHJpbSgpLnN1YnN0cigoY3VyVmFsdWUgKyBcIlwiKS5sZW5ndGgpIHx8IFwicHhcIixcbiAgICAgICAgc3R5bGUgPSBfdGVtcERpdi5zdHlsZSxcbiAgICAgICAgaG9yaXpvbnRhbCA9IF9ob3Jpem9udGFsRXhwLnRlc3QocHJvcGVydHkpLFxuICAgICAgICBpc1Jvb3RTVkcgPSB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiLFxuICAgICAgICBtZWFzdXJlUHJvcGVydHkgPSAoaXNSb290U1ZHID8gXCJjbGllbnRcIiA6IFwib2Zmc2V0XCIpICsgKGhvcml6b250YWwgPyBcIldpZHRoXCIgOiBcIkhlaWdodFwiKSxcbiAgICAgICAgYW1vdW50ID0gMTAwLFxuICAgICAgICB0b1BpeGVscyA9IHVuaXQgPT09IFwicHhcIixcbiAgICAgICAgdG9QZXJjZW50ID0gdW5pdCA9PT0gXCIlXCIsXG4gICAgICAgIHB4LFxuICAgICAgICBwYXJlbnQsXG4gICAgICAgIGNhY2hlLFxuICAgICAgICBpc1NWRztcblxuICAgIGlmICh1bml0ID09PSBjdXJVbml0IHx8ICFjdXJWYWx1ZSB8fCBfbm9uQ29udmVydGlibGVVbml0c1t1bml0XSB8fCBfbm9uQ29udmVydGlibGVVbml0c1tjdXJVbml0XSkge1xuICAgICAgcmV0dXJuIGN1clZhbHVlO1xuICAgIH1cblxuICAgIGN1clVuaXQgIT09IFwicHhcIiAmJiAhdG9QaXhlbHMgJiYgKGN1clZhbHVlID0gX2NvbnZlcnRUb1VuaXQodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIFwicHhcIikpO1xuICAgIGlzU1ZHID0gdGFyZ2V0LmdldENUTSAmJiBfaXNTVkcodGFyZ2V0KTtcblxuICAgIGlmICgodG9QZXJjZW50IHx8IGN1clVuaXQgPT09IFwiJVwiKSAmJiAoX3RyYW5zZm9ybVByb3BzW3Byb3BlcnR5XSB8fCB+cHJvcGVydHkuaW5kZXhPZihcImFkaXVzXCIpKSkge1xuICAgICAgcHggPSBpc1NWRyA/IHRhcmdldC5nZXRCQm94KClbaG9yaXpvbnRhbCA/IFwid2lkdGhcIiA6IFwiaGVpZ2h0XCJdIDogdGFyZ2V0W21lYXN1cmVQcm9wZXJ0eV07XG4gICAgICByZXR1cm4gX3JvdW5kKHRvUGVyY2VudCA/IGN1clZhbHVlIC8gcHggKiBhbW91bnQgOiBjdXJWYWx1ZSAvIDEwMCAqIHB4KTtcbiAgICB9XG5cbiAgICBzdHlsZVtob3Jpem9udGFsID8gXCJ3aWR0aFwiIDogXCJoZWlnaHRcIl0gPSBhbW91bnQgKyAodG9QaXhlbHMgPyBjdXJVbml0IDogdW5pdCk7XG4gICAgcGFyZW50ID0gfnByb3BlcnR5LmluZGV4T2YoXCJhZGl1c1wiKSB8fCB1bml0ID09PSBcImVtXCIgJiYgdGFyZ2V0LmFwcGVuZENoaWxkICYmICFpc1Jvb3RTVkcgPyB0YXJnZXQgOiB0YXJnZXQucGFyZW50Tm9kZTtcblxuICAgIGlmIChpc1NWRykge1xuICAgICAgcGFyZW50ID0gKHRhcmdldC5vd25lclNWR0VsZW1lbnQgfHwge30pLnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJlbnQgfHwgcGFyZW50ID09PSBfZG9jJDEgfHwgIXBhcmVudC5hcHBlbmRDaGlsZCkge1xuICAgICAgcGFyZW50ID0gX2RvYyQxLmJvZHk7XG4gICAgfVxuXG4gICAgY2FjaGUgPSBwYXJlbnQuX2dzYXA7XG5cbiAgICBpZiAoY2FjaGUgJiYgdG9QZXJjZW50ICYmIGNhY2hlLndpZHRoICYmIGhvcml6b250YWwgJiYgY2FjaGUudGltZSA9PT0gX3RpY2tlci50aW1lKSB7XG4gICAgICByZXR1cm4gX3JvdW5kKGN1clZhbHVlIC8gY2FjaGUud2lkdGggKiBhbW91bnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAodG9QZXJjZW50IHx8IGN1clVuaXQgPT09IFwiJVwiKSAmJiAoc3R5bGUucG9zaXRpb24gPSBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIFwicG9zaXRpb25cIikpO1xuICAgICAgcGFyZW50ID09PSB0YXJnZXQgJiYgKHN0eWxlLnBvc2l0aW9uID0gXCJzdGF0aWNcIik7XG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoX3RlbXBEaXYpO1xuICAgICAgcHggPSBfdGVtcERpdlttZWFzdXJlUHJvcGVydHldO1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF90ZW1wRGl2KTtcbiAgICAgIHN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXG4gICAgICBpZiAoaG9yaXpvbnRhbCAmJiB0b1BlcmNlbnQpIHtcbiAgICAgICAgY2FjaGUgPSBfZ2V0Q2FjaGUocGFyZW50KTtcbiAgICAgICAgY2FjaGUudGltZSA9IF90aWNrZXIudGltZTtcbiAgICAgICAgY2FjaGUud2lkdGggPSBwYXJlbnRbbWVhc3VyZVByb3BlcnR5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX3JvdW5kKHRvUGl4ZWxzID8gcHggKiBjdXJWYWx1ZSAvIGFtb3VudCA6IHB4ICYmIGN1clZhbHVlID8gYW1vdW50IC8gcHggKiBjdXJWYWx1ZSA6IDApO1xuICB9LFxuICAgICAgX2dldCA9IGZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgdW5pdCwgdW5jYWNoZSkge1xuICAgIHZhciB2YWx1ZTtcbiAgICBfcGx1Z2luSW5pdHRlZCB8fCBfaW5pdENvcmUoKTtcblxuICAgIGlmIChwcm9wZXJ0eSBpbiBfcHJvcGVydHlBbGlhc2VzICYmIHByb3BlcnR5ICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICBwcm9wZXJ0eSA9IF9wcm9wZXJ0eUFsaWFzZXNbcHJvcGVydHldO1xuXG4gICAgICBpZiAofnByb3BlcnR5LmluZGV4T2YoXCIsXCIpKSB7XG4gICAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkuc3BsaXQoXCIsXCIpWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfdHJhbnNmb3JtUHJvcHNbcHJvcGVydHldICYmIHByb3BlcnR5ICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICB2YWx1ZSA9IF9wYXJzZVRyYW5zZm9ybSh0YXJnZXQsIHVuY2FjaGUpO1xuICAgICAgdmFsdWUgPSBwcm9wZXJ0eSAhPT0gXCJ0cmFuc2Zvcm1PcmlnaW5cIiA/IHZhbHVlW3Byb3BlcnR5XSA6IHZhbHVlLnN2ZyA/IHZhbHVlLm9yaWdpbiA6IF9maXJzdFR3b09ubHkoX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBfdHJhbnNmb3JtT3JpZ2luUHJvcCkpICsgXCIgXCIgKyB2YWx1ZS56T3JpZ2luICsgXCJweFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHRhcmdldC5zdHlsZVtwcm9wZXJ0eV07XG5cbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUgPT09IFwiYXV0b1wiIHx8IHVuY2FjaGUgfHwgfih2YWx1ZSArIFwiXCIpLmluZGV4T2YoXCJjYWxjKFwiKSkge1xuICAgICAgICB2YWx1ZSA9IF9zcGVjaWFsUHJvcHNbcHJvcGVydHldICYmIF9zcGVjaWFsUHJvcHNbcHJvcGVydHldKHRhcmdldCwgcHJvcGVydHksIHVuaXQpIHx8IF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgcHJvcGVydHkpIHx8IF9nZXRQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5KSB8fCAocHJvcGVydHkgPT09IFwib3BhY2l0eVwiID8gMSA6IDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bml0ICYmICF+KHZhbHVlICsgXCJcIikudHJpbSgpLmluZGV4T2YoXCIgXCIpID8gX2NvbnZlcnRUb1VuaXQodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIHVuaXQpICsgdW5pdCA6IHZhbHVlO1xuICB9LFxuICAgICAgX3R3ZWVuQ29tcGxleENTU1N0cmluZyA9IGZ1bmN0aW9uIF90d2VlbkNvbXBsZXhDU1NTdHJpbmcodGFyZ2V0LCBwcm9wLCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKCFzdGFydCB8fCBzdGFydCA9PT0gXCJub25lXCIpIHtcbiAgICAgIHZhciBwID0gX2NoZWNrUHJvcFByZWZpeChwcm9wLCB0YXJnZXQsIDEpLFxuICAgICAgICAgIHMgPSBwICYmIF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgcCwgMSk7XG5cbiAgICAgIGlmIChzICYmIHMgIT09IHN0YXJ0KSB7XG4gICAgICAgIHByb3AgPSBwO1xuICAgICAgICBzdGFydCA9IHM7XG4gICAgICB9IGVsc2UgaWYgKHByb3AgPT09IFwiYm9yZGVyQ29sb3JcIikge1xuICAgICAgICBzdGFydCA9IF9nZXRDb21wdXRlZFByb3BlcnR5KHRhcmdldCwgXCJib3JkZXJUb3BDb2xvclwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCB0YXJnZXQuc3R5bGUsIHByb3AsIDAsIDEsIF9yZW5kZXJDb21wbGV4U3RyaW5nKSxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBtYXRjaEluZGV4ID0gMCxcbiAgICAgICAgYSxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBzdGFydFZhbHVlcyxcbiAgICAgICAgc3RhcnROdW0sXG4gICAgICAgIGNvbG9yLFxuICAgICAgICBzdGFydFZhbHVlLFxuICAgICAgICBlbmRWYWx1ZSxcbiAgICAgICAgZW5kTnVtLFxuICAgICAgICBjaHVuayxcbiAgICAgICAgZW5kVW5pdCxcbiAgICAgICAgc3RhcnRVbml0LFxuICAgICAgICByZWxhdGl2ZSxcbiAgICAgICAgZW5kVmFsdWVzO1xuICAgIHB0LmIgPSBzdGFydDtcbiAgICBwdC5lID0gZW5kO1xuICAgIHN0YXJ0ICs9IFwiXCI7XG4gICAgZW5kICs9IFwiXCI7XG5cbiAgICBpZiAoZW5kID09PSBcImF1dG9cIikge1xuICAgICAgdGFyZ2V0LnN0eWxlW3Byb3BdID0gZW5kO1xuICAgICAgZW5kID0gX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBwcm9wKSB8fCBlbmQ7XG4gICAgICB0YXJnZXQuc3R5bGVbcHJvcF0gPSBzdGFydDtcbiAgICB9XG5cbiAgICBhID0gW3N0YXJ0LCBlbmRdO1xuXG4gICAgX2NvbG9yU3RyaW5nRmlsdGVyKGEpO1xuXG4gICAgc3RhcnQgPSBhWzBdO1xuICAgIGVuZCA9IGFbMV07XG4gICAgc3RhcnRWYWx1ZXMgPSBzdGFydC5tYXRjaChfbnVtV2l0aFVuaXRFeHApIHx8IFtdO1xuICAgIGVuZFZhbHVlcyA9IGVuZC5tYXRjaChfbnVtV2l0aFVuaXRFeHApIHx8IFtdO1xuXG4gICAgaWYgKGVuZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIHdoaWxlIChyZXN1bHQgPSBfbnVtV2l0aFVuaXRFeHAuZXhlYyhlbmQpKSB7XG4gICAgICAgIGVuZFZhbHVlID0gcmVzdWx0WzBdO1xuICAgICAgICBjaHVuayA9IGVuZC5zdWJzdHJpbmcoaW5kZXgsIHJlc3VsdC5pbmRleCk7XG5cbiAgICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgICAgY29sb3IgPSAoY29sb3IgKyAxKSAlIDU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmsuc3Vic3RyKC01KSA9PT0gXCJyZ2JhKFwiIHx8IGNodW5rLnN1YnN0cigtNSkgPT09IFwiaHNsYShcIikge1xuICAgICAgICAgIGNvbG9yID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmRWYWx1ZSAhPT0gKHN0YXJ0VmFsdWUgPSBzdGFydFZhbHVlc1ttYXRjaEluZGV4KytdIHx8IFwiXCIpKSB7XG4gICAgICAgICAgc3RhcnROdW0gPSBwYXJzZUZsb2F0KHN0YXJ0VmFsdWUpIHx8IDA7XG4gICAgICAgICAgc3RhcnRVbml0ID0gc3RhcnRWYWx1ZS5zdWJzdHIoKHN0YXJ0TnVtICsgXCJcIikubGVuZ3RoKTtcbiAgICAgICAgICByZWxhdGl2ZSA9IGVuZFZhbHVlLmNoYXJBdCgxKSA9PT0gXCI9XCIgPyArKGVuZFZhbHVlLmNoYXJBdCgwKSArIFwiMVwiKSA6IDA7XG5cbiAgICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgIGVuZFZhbHVlID0gZW5kVmFsdWUuc3Vic3RyKDIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVuZE51bSA9IHBhcnNlRmxvYXQoZW5kVmFsdWUpO1xuICAgICAgICAgIGVuZFVuaXQgPSBlbmRWYWx1ZS5zdWJzdHIoKGVuZE51bSArIFwiXCIpLmxlbmd0aCk7XG4gICAgICAgICAgaW5kZXggPSBfbnVtV2l0aFVuaXRFeHAubGFzdEluZGV4IC0gZW5kVW5pdC5sZW5ndGg7XG5cbiAgICAgICAgICBpZiAoIWVuZFVuaXQpIHtcbiAgICAgICAgICAgIGVuZFVuaXQgPSBlbmRVbml0IHx8IF9jb25maWcudW5pdHNbcHJvcF0gfHwgc3RhcnRVbml0O1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IGVuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZW5kICs9IGVuZFVuaXQ7XG4gICAgICAgICAgICAgIHB0LmUgKz0gZW5kVW5pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3RhcnRVbml0ICE9PSBlbmRVbml0KSB7XG4gICAgICAgICAgICBzdGFydE51bSA9IF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgcHJvcCwgc3RhcnRWYWx1ZSwgZW5kVW5pdCkgfHwgMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwdC5fcHQgPSB7XG4gICAgICAgICAgICBfbmV4dDogcHQuX3B0LFxuICAgICAgICAgICAgcDogY2h1bmsgfHwgbWF0Y2hJbmRleCA9PT0gMSA/IGNodW5rIDogXCIsXCIsXG4gICAgICAgICAgICBzOiBzdGFydE51bSxcbiAgICAgICAgICAgIGM6IHJlbGF0aXZlID8gcmVsYXRpdmUgKiBlbmROdW0gOiBlbmROdW0gLSBzdGFydE51bSxcbiAgICAgICAgICAgIG06IGNvbG9yICYmIGNvbG9yIDwgNCB8fCBwcm9wID09PSBcInpJbmRleFwiID8gTWF0aC5yb3VuZCA6IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHB0LmMgPSBpbmRleCA8IGVuZC5sZW5ndGggPyBlbmQuc3Vic3RyaW5nKGluZGV4LCBlbmQubGVuZ3RoKSA6IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHB0LnIgPSBwcm9wID09PSBcImRpc3BsYXlcIiAmJiBlbmQgPT09IFwibm9uZVwiID8gX3JlbmRlck5vblR3ZWVuaW5nVmFsdWVPbmx5QXRFbmQgOiBfcmVuZGVyTm9uVHdlZW5pbmdWYWx1ZTtcbiAgICB9XG5cbiAgICBfcmVsRXhwLnRlc3QoZW5kKSAmJiAocHQuZSA9IDApO1xuICAgIHRoaXMuX3B0ID0gcHQ7XG4gICAgcmV0dXJuIHB0O1xuICB9LFxuICAgICAgX2tleXdvcmRUb1BlcmNlbnQgPSB7XG4gICAgdG9wOiBcIjAlXCIsXG4gICAgYm90dG9tOiBcIjEwMCVcIixcbiAgICBsZWZ0OiBcIjAlXCIsXG4gICAgcmlnaHQ6IFwiMTAwJVwiLFxuICAgIGNlbnRlcjogXCI1MCVcIlxuICB9LFxuICAgICAgX2NvbnZlcnRLZXl3b3Jkc1RvUGVyY2VudGFnZXMgPSBmdW5jdGlvbiBfY29udmVydEtleXdvcmRzVG9QZXJjZW50YWdlcyh2YWx1ZSkge1xuICAgIHZhciBzcGxpdCA9IHZhbHVlLnNwbGl0KFwiIFwiKSxcbiAgICAgICAgeCA9IHNwbGl0WzBdLFxuICAgICAgICB5ID0gc3BsaXRbMV0gfHwgXCI1MCVcIjtcblxuICAgIGlmICh4ID09PSBcInRvcFwiIHx8IHggPT09IFwiYm90dG9tXCIgfHwgeSA9PT0gXCJsZWZ0XCIgfHwgeSA9PT0gXCJyaWdodFwiKSB7XG4gICAgICB2YWx1ZSA9IHg7XG4gICAgICB4ID0geTtcbiAgICAgIHkgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBzcGxpdFswXSA9IF9rZXl3b3JkVG9QZXJjZW50W3hdIHx8IHg7XG4gICAgc3BsaXRbMV0gPSBfa2V5d29yZFRvUGVyY2VudFt5XSB8fCB5O1xuICAgIHJldHVybiBzcGxpdC5qb2luKFwiIFwiKTtcbiAgfSxcbiAgICAgIF9yZW5kZXJDbGVhclByb3BzID0gZnVuY3Rpb24gX3JlbmRlckNsZWFyUHJvcHMocmF0aW8sIGRhdGEpIHtcbiAgICBpZiAoZGF0YS50d2VlbiAmJiBkYXRhLnR3ZWVuLl90aW1lID09PSBkYXRhLnR3ZWVuLl9kdXIpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBkYXRhLnQsXG4gICAgICAgICAgc3R5bGUgPSB0YXJnZXQuc3R5bGUsXG4gICAgICAgICAgcHJvcHMgPSBkYXRhLnUsXG4gICAgICAgICAgY2FjaGUgPSB0YXJnZXQuX2dzYXAsXG4gICAgICAgICAgcHJvcCxcbiAgICAgICAgICBjbGVhclRyYW5zZm9ybXMsXG4gICAgICAgICAgaTtcblxuICAgICAgaWYgKHByb3BzID09PSBcImFsbFwiIHx8IHByb3BzID09PSB0cnVlKSB7XG4gICAgICAgIHN0eWxlLmNzc1RleHQgPSBcIlwiO1xuICAgICAgICBjbGVhclRyYW5zZm9ybXMgPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcHMgPSBwcm9wcy5zcGxpdChcIixcIik7XG4gICAgICAgIGkgPSBwcm9wcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKC0taSA+IC0xKSB7XG4gICAgICAgICAgcHJvcCA9IHByb3BzW2ldO1xuXG4gICAgICAgICAgaWYgKF90cmFuc2Zvcm1Qcm9wc1twcm9wXSkge1xuICAgICAgICAgICAgY2xlYXJUcmFuc2Zvcm1zID0gMTtcbiAgICAgICAgICAgIHByb3AgPSBwcm9wID09PSBcInRyYW5zZm9ybU9yaWdpblwiID8gX3RyYW5zZm9ybU9yaWdpblByb3AgOiBfdHJhbnNmb3JtUHJvcDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfcmVtb3ZlUHJvcGVydHkodGFyZ2V0LCBwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2xlYXJUcmFuc2Zvcm1zKSB7XG4gICAgICAgIF9yZW1vdmVQcm9wZXJ0eSh0YXJnZXQsIF90cmFuc2Zvcm1Qcm9wKTtcblxuICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICBjYWNoZS5zdmcgJiYgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcblxuICAgICAgICAgIF9wYXJzZVRyYW5zZm9ybSh0YXJnZXQsIDEpO1xuXG4gICAgICAgICAgY2FjaGUudW5jYWNoZSA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBfc3BlY2lhbFByb3BzID0ge1xuICAgIGNsZWFyUHJvcHM6IGZ1bmN0aW9uIGNsZWFyUHJvcHMocGx1Z2luLCB0YXJnZXQsIHByb3BlcnR5LCBlbmRWYWx1ZSwgdHdlZW4pIHtcbiAgICAgIGlmICh0d2Vlbi5kYXRhICE9PSBcImlzRnJvbVN0YXJ0XCIpIHtcbiAgICAgICAgdmFyIHB0ID0gcGx1Z2luLl9wdCA9IG5ldyBQcm9wVHdlZW4ocGx1Z2luLl9wdCwgdGFyZ2V0LCBwcm9wZXJ0eSwgMCwgMCwgX3JlbmRlckNsZWFyUHJvcHMpO1xuICAgICAgICBwdC51ID0gZW5kVmFsdWU7XG4gICAgICAgIHB0LnByID0gLTEwO1xuICAgICAgICBwdC50d2VlbiA9IHR3ZWVuO1xuXG4gICAgICAgIHBsdWdpbi5fcHJvcHMucHVzaChwcm9wZXJ0eSk7XG5cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAgICAgX2lkZW50aXR5MkRNYXRyaXggPSBbMSwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBfcm90YXRpb25hbFByb3BlcnRpZXMgPSB7fSxcbiAgICAgIF9pc051bGxUcmFuc2Zvcm0gPSBmdW5jdGlvbiBfaXNOdWxsVHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBcIm1hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKVwiIHx8IHZhbHVlID09PSBcIm5vbmVcIiB8fCAhdmFsdWU7XG4gIH0sXG4gICAgICBfZ2V0Q29tcHV0ZWRUcmFuc2Zvcm1NYXRyaXhBc0FycmF5ID0gZnVuY3Rpb24gX2dldENvbXB1dGVkVHJhbnNmb3JtTWF0cml4QXNBcnJheSh0YXJnZXQpIHtcbiAgICB2YXIgbWF0cml4U3RyaW5nID0gX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBfdHJhbnNmb3JtUHJvcCk7XG5cbiAgICByZXR1cm4gX2lzTnVsbFRyYW5zZm9ybShtYXRyaXhTdHJpbmcpID8gX2lkZW50aXR5MkRNYXRyaXggOiBtYXRyaXhTdHJpbmcuc3Vic3RyKDcpLm1hdGNoKF9udW1FeHApLm1hcChfcm91bmQpO1xuICB9LFxuICAgICAgX2dldE1hdHJpeCA9IGZ1bmN0aW9uIF9nZXRNYXRyaXgodGFyZ2V0LCBmb3JjZTJEKSB7XG4gICAgdmFyIGNhY2hlID0gdGFyZ2V0Ll9nc2FwIHx8IF9nZXRDYWNoZSh0YXJnZXQpLFxuICAgICAgICBzdHlsZSA9IHRhcmdldC5zdHlsZSxcbiAgICAgICAgbWF0cml4ID0gX2dldENvbXB1dGVkVHJhbnNmb3JtTWF0cml4QXNBcnJheSh0YXJnZXQpLFxuICAgICAgICBwYXJlbnQsXG4gICAgICAgIG5leHRTaWJsaW5nLFxuICAgICAgICB0ZW1wLFxuICAgICAgICBhZGRlZFRvRE9NO1xuXG4gICAgaWYgKGNhY2hlLnN2ZyAmJiB0YXJnZXQuZ2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIpKSB7XG4gICAgICB0ZW1wID0gdGFyZ2V0LnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkubWF0cml4O1xuICAgICAgbWF0cml4ID0gW3RlbXAuYSwgdGVtcC5iLCB0ZW1wLmMsIHRlbXAuZCwgdGVtcC5lLCB0ZW1wLmZdO1xuICAgICAgcmV0dXJuIG1hdHJpeC5qb2luKFwiLFwiKSA9PT0gXCIxLDAsMCwxLDAsMFwiID8gX2lkZW50aXR5MkRNYXRyaXggOiBtYXRyaXg7XG4gICAgfSBlbHNlIGlmIChtYXRyaXggPT09IF9pZGVudGl0eTJETWF0cml4ICYmICF0YXJnZXQub2Zmc2V0UGFyZW50ICYmIHRhcmdldCAhPT0gX2RvY0VsZW1lbnQgJiYgIWNhY2hlLnN2Zykge1xuICAgICAgdGVtcCA9IHN0eWxlLmRpc3BsYXk7XG4gICAgICBzdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgcGFyZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG5cbiAgICAgIGlmICghcGFyZW50IHx8ICF0YXJnZXQub2Zmc2V0UGFyZW50KSB7XG4gICAgICAgIGFkZGVkVG9ET00gPSAxO1xuICAgICAgICBuZXh0U2libGluZyA9IHRhcmdldC5uZXh0U2libGluZztcblxuICAgICAgICBfZG9jRWxlbWVudC5hcHBlbmRDaGlsZCh0YXJnZXQpO1xuICAgICAgfVxuXG4gICAgICBtYXRyaXggPSBfZ2V0Q29tcHV0ZWRUcmFuc2Zvcm1NYXRyaXhBc0FycmF5KHRhcmdldCk7XG4gICAgICB0ZW1wID8gc3R5bGUuZGlzcGxheSA9IHRlbXAgOiBfcmVtb3ZlUHJvcGVydHkodGFyZ2V0LCBcImRpc3BsYXlcIik7XG5cbiAgICAgIGlmIChhZGRlZFRvRE9NKSB7XG4gICAgICAgIG5leHRTaWJsaW5nID8gcGFyZW50Lmluc2VydEJlZm9yZSh0YXJnZXQsIG5leHRTaWJsaW5nKSA6IHBhcmVudCA/IHBhcmVudC5hcHBlbmRDaGlsZCh0YXJnZXQpIDogX2RvY0VsZW1lbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9yY2UyRCAmJiBtYXRyaXgubGVuZ3RoID4gNiA/IFttYXRyaXhbMF0sIG1hdHJpeFsxXSwgbWF0cml4WzRdLCBtYXRyaXhbNV0sIG1hdHJpeFsxMl0sIG1hdHJpeFsxM11dIDogbWF0cml4O1xuICB9LFxuICAgICAgX2FwcGx5U1ZHT3JpZ2luID0gZnVuY3Rpb24gX2FwcGx5U1ZHT3JpZ2luKHRhcmdldCwgb3JpZ2luLCBvcmlnaW5Jc0Fic29sdXRlLCBzbW9vdGgsIG1hdHJpeEFycmF5LCBwbHVnaW5Ub0FkZFByb3BUd2VlbnNUbykge1xuICAgIHZhciBjYWNoZSA9IHRhcmdldC5fZ3NhcCxcbiAgICAgICAgbWF0cml4ID0gbWF0cml4QXJyYXkgfHwgX2dldE1hdHJpeCh0YXJnZXQsIHRydWUpLFxuICAgICAgICB4T3JpZ2luT2xkID0gY2FjaGUueE9yaWdpbiB8fCAwLFxuICAgICAgICB5T3JpZ2luT2xkID0gY2FjaGUueU9yaWdpbiB8fCAwLFxuICAgICAgICB4T2Zmc2V0T2xkID0gY2FjaGUueE9mZnNldCB8fCAwLFxuICAgICAgICB5T2Zmc2V0T2xkID0gY2FjaGUueU9mZnNldCB8fCAwLFxuICAgICAgICBhID0gbWF0cml4WzBdLFxuICAgICAgICBiID0gbWF0cml4WzFdLFxuICAgICAgICBjID0gbWF0cml4WzJdLFxuICAgICAgICBkID0gbWF0cml4WzNdLFxuICAgICAgICB0eCA9IG1hdHJpeFs0XSxcbiAgICAgICAgdHkgPSBtYXRyaXhbNV0sXG4gICAgICAgIG9yaWdpblNwbGl0ID0gb3JpZ2luLnNwbGl0KFwiIFwiKSxcbiAgICAgICAgeE9yaWdpbiA9IHBhcnNlRmxvYXQob3JpZ2luU3BsaXRbMF0pIHx8IDAsXG4gICAgICAgIHlPcmlnaW4gPSBwYXJzZUZsb2F0KG9yaWdpblNwbGl0WzFdKSB8fCAwLFxuICAgICAgICBib3VuZHMsXG4gICAgICAgIGRldGVybWluYW50LFxuICAgICAgICB4LFxuICAgICAgICB5O1xuXG4gICAgaWYgKCFvcmlnaW5Jc0Fic29sdXRlKSB7XG4gICAgICBib3VuZHMgPSBfZ2V0QkJveCh0YXJnZXQpO1xuICAgICAgeE9yaWdpbiA9IGJvdW5kcy54ICsgKH5vcmlnaW5TcGxpdFswXS5pbmRleE9mKFwiJVwiKSA/IHhPcmlnaW4gLyAxMDAgKiBib3VuZHMud2lkdGggOiB4T3JpZ2luKTtcbiAgICAgIHlPcmlnaW4gPSBib3VuZHMueSArICh+KG9yaWdpblNwbGl0WzFdIHx8IG9yaWdpblNwbGl0WzBdKS5pbmRleE9mKFwiJVwiKSA/IHlPcmlnaW4gLyAxMDAgKiBib3VuZHMuaGVpZ2h0IDogeU9yaWdpbik7XG4gICAgfSBlbHNlIGlmIChtYXRyaXggIT09IF9pZGVudGl0eTJETWF0cml4ICYmIChkZXRlcm1pbmFudCA9IGEgKiBkIC0gYiAqIGMpKSB7XG4gICAgICB4ID0geE9yaWdpbiAqIChkIC8gZGV0ZXJtaW5hbnQpICsgeU9yaWdpbiAqICgtYyAvIGRldGVybWluYW50KSArIChjICogdHkgLSBkICogdHgpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICB5ID0geE9yaWdpbiAqICgtYiAvIGRldGVybWluYW50KSArIHlPcmlnaW4gKiAoYSAvIGRldGVybWluYW50KSAtIChhICogdHkgLSBiICogdHgpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICB4T3JpZ2luID0geDtcbiAgICAgIHlPcmlnaW4gPSB5O1xuICAgIH1cblxuICAgIGlmIChzbW9vdGggfHwgc21vb3RoICE9PSBmYWxzZSAmJiBjYWNoZS5zbW9vdGgpIHtcbiAgICAgIHR4ID0geE9yaWdpbiAtIHhPcmlnaW5PbGQ7XG4gICAgICB0eSA9IHlPcmlnaW4gLSB5T3JpZ2luT2xkO1xuICAgICAgY2FjaGUueE9mZnNldCA9IHhPZmZzZXRPbGQgKyAodHggKiBhICsgdHkgKiBjKSAtIHR4O1xuICAgICAgY2FjaGUueU9mZnNldCA9IHlPZmZzZXRPbGQgKyAodHggKiBiICsgdHkgKiBkKSAtIHR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWNoZS54T2Zmc2V0ID0gY2FjaGUueU9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgY2FjaGUueE9yaWdpbiA9IHhPcmlnaW47XG4gICAgY2FjaGUueU9yaWdpbiA9IHlPcmlnaW47XG4gICAgY2FjaGUuc21vb3RoID0gISFzbW9vdGg7XG4gICAgY2FjaGUub3JpZ2luID0gb3JpZ2luO1xuICAgIGNhY2hlLm9yaWdpbklzQWJzb2x1dGUgPSAhIW9yaWdpbklzQWJzb2x1dGU7XG4gICAgdGFyZ2V0LnN0eWxlW190cmFuc2Zvcm1PcmlnaW5Qcm9wXSA9IFwiMHB4IDBweFwiO1xuXG4gICAgaWYgKHBsdWdpblRvQWRkUHJvcFR3ZWVuc1RvKSB7XG4gICAgICBfYWRkTm9uVHdlZW5pbmdQVChwbHVnaW5Ub0FkZFByb3BUd2VlbnNUbywgY2FjaGUsIFwieE9yaWdpblwiLCB4T3JpZ2luT2xkLCB4T3JpZ2luKTtcblxuICAgICAgX2FkZE5vblR3ZWVuaW5nUFQocGx1Z2luVG9BZGRQcm9wVHdlZW5zVG8sIGNhY2hlLCBcInlPcmlnaW5cIiwgeU9yaWdpbk9sZCwgeU9yaWdpbik7XG5cbiAgICAgIF9hZGROb25Ud2VlbmluZ1BUKHBsdWdpblRvQWRkUHJvcFR3ZWVuc1RvLCBjYWNoZSwgXCJ4T2Zmc2V0XCIsIHhPZmZzZXRPbGQsIGNhY2hlLnhPZmZzZXQpO1xuXG4gICAgICBfYWRkTm9uVHdlZW5pbmdQVChwbHVnaW5Ub0FkZFByb3BUd2VlbnNUbywgY2FjaGUsIFwieU9mZnNldFwiLCB5T2Zmc2V0T2xkLCBjYWNoZS55T2Zmc2V0KTtcbiAgICB9XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKFwiZGF0YS1zdmctb3JpZ2luXCIsIHhPcmlnaW4gKyBcIiBcIiArIHlPcmlnaW4pO1xuICB9LFxuICAgICAgX3BhcnNlVHJhbnNmb3JtID0gZnVuY3Rpb24gX3BhcnNlVHJhbnNmb3JtKHRhcmdldCwgdW5jYWNoZSkge1xuICAgIHZhciBjYWNoZSA9IHRhcmdldC5fZ3NhcCB8fCBuZXcgR1NDYWNoZSh0YXJnZXQpO1xuXG4gICAgaWYgKFwieFwiIGluIGNhY2hlICYmICF1bmNhY2hlICYmICFjYWNoZS51bmNhY2hlKSB7XG4gICAgICByZXR1cm4gY2FjaGU7XG4gICAgfVxuXG4gICAgdmFyIHN0eWxlID0gdGFyZ2V0LnN0eWxlLFxuICAgICAgICBpbnZlcnRlZFNjYWxlWCA9IGNhY2hlLnNjYWxlWCA8IDAsXG4gICAgICAgIHB4ID0gXCJweFwiLFxuICAgICAgICBkZWcgPSBcImRlZ1wiLFxuICAgICAgICBvcmlnaW4gPSBfZ2V0Q29tcHV0ZWRQcm9wZXJ0eSh0YXJnZXQsIF90cmFuc2Zvcm1PcmlnaW5Qcm9wKSB8fCBcIjBcIixcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgeixcbiAgICAgICAgc2NhbGVYLFxuICAgICAgICBzY2FsZVksXG4gICAgICAgIHJvdGF0aW9uLFxuICAgICAgICByb3RhdGlvblgsXG4gICAgICAgIHJvdGF0aW9uWSxcbiAgICAgICAgc2tld1gsXG4gICAgICAgIHNrZXdZLFxuICAgICAgICBwZXJzcGVjdGl2ZSxcbiAgICAgICAgeE9yaWdpbixcbiAgICAgICAgeU9yaWdpbixcbiAgICAgICAgbWF0cml4LFxuICAgICAgICBhbmdsZSxcbiAgICAgICAgY29zLFxuICAgICAgICBzaW4sXG4gICAgICAgIGEsXG4gICAgICAgIGIsXG4gICAgICAgIGMsXG4gICAgICAgIGQsXG4gICAgICAgIGExMixcbiAgICAgICAgYTIyLFxuICAgICAgICB0MSxcbiAgICAgICAgdDIsXG4gICAgICAgIHQzLFxuICAgICAgICBhMTMsXG4gICAgICAgIGEyMyxcbiAgICAgICAgYTMzLFxuICAgICAgICBhNDIsXG4gICAgICAgIGE0MyxcbiAgICAgICAgYTMyO1xuICAgIHggPSB5ID0geiA9IHJvdGF0aW9uID0gcm90YXRpb25YID0gcm90YXRpb25ZID0gc2tld1ggPSBza2V3WSA9IHBlcnNwZWN0aXZlID0gMDtcbiAgICBzY2FsZVggPSBzY2FsZVkgPSAxO1xuICAgIGNhY2hlLnN2ZyA9ICEhKHRhcmdldC5nZXRDVE0gJiYgX2lzU1ZHKHRhcmdldCkpO1xuICAgIG1hdHJpeCA9IF9nZXRNYXRyaXgodGFyZ2V0LCBjYWNoZS5zdmcpO1xuXG4gICAgaWYgKGNhY2hlLnN2Zykge1xuICAgICAgdDEgPSAoIWNhY2hlLnVuY2FjaGUgfHwgb3JpZ2luID09PSBcIjBweCAwcHhcIikgJiYgIXVuY2FjaGUgJiYgdGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtc3ZnLW9yaWdpblwiKTtcblxuICAgICAgX2FwcGx5U1ZHT3JpZ2luKHRhcmdldCwgdDEgfHwgb3JpZ2luLCAhIXQxIHx8IGNhY2hlLm9yaWdpbklzQWJzb2x1dGUsIGNhY2hlLnNtb290aCAhPT0gZmFsc2UsIG1hdHJpeCk7XG4gICAgfVxuXG4gICAgeE9yaWdpbiA9IGNhY2hlLnhPcmlnaW4gfHwgMDtcbiAgICB5T3JpZ2luID0gY2FjaGUueU9yaWdpbiB8fCAwO1xuXG4gICAgaWYgKG1hdHJpeCAhPT0gX2lkZW50aXR5MkRNYXRyaXgpIHtcbiAgICAgIGEgPSBtYXRyaXhbMF07XG4gICAgICBiID0gbWF0cml4WzFdO1xuICAgICAgYyA9IG1hdHJpeFsyXTtcbiAgICAgIGQgPSBtYXRyaXhbM107XG4gICAgICB4ID0gYTEyID0gbWF0cml4WzRdO1xuICAgICAgeSA9IGEyMiA9IG1hdHJpeFs1XTtcblxuICAgICAgaWYgKG1hdHJpeC5sZW5ndGggPT09IDYpIHtcbiAgICAgICAgc2NhbGVYID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuICAgICAgICBzY2FsZVkgPSBNYXRoLnNxcnQoZCAqIGQgKyBjICogYyk7XG4gICAgICAgIHJvdGF0aW9uID0gYSB8fCBiID8gX2F0YW4yKGIsIGEpICogX1JBRDJERUcgOiAwO1xuICAgICAgICBza2V3WCA9IGMgfHwgZCA/IF9hdGFuMihjLCBkKSAqIF9SQUQyREVHICsgcm90YXRpb24gOiAwO1xuICAgICAgICBza2V3WCAmJiAoc2NhbGVZICo9IE1hdGguYWJzKE1hdGguY29zKHNrZXdYICogX0RFRzJSQUQpKSk7XG5cbiAgICAgICAgaWYgKGNhY2hlLnN2Zykge1xuICAgICAgICAgIHggLT0geE9yaWdpbiAtICh4T3JpZ2luICogYSArIHlPcmlnaW4gKiBjKTtcbiAgICAgICAgICB5IC09IHlPcmlnaW4gLSAoeE9yaWdpbiAqIGIgKyB5T3JpZ2luICogZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGEzMiA9IG1hdHJpeFs2XTtcbiAgICAgICAgYTQyID0gbWF0cml4WzddO1xuICAgICAgICBhMTMgPSBtYXRyaXhbOF07XG4gICAgICAgIGEyMyA9IG1hdHJpeFs5XTtcbiAgICAgICAgYTMzID0gbWF0cml4WzEwXTtcbiAgICAgICAgYTQzID0gbWF0cml4WzExXTtcbiAgICAgICAgeCA9IG1hdHJpeFsxMl07XG4gICAgICAgIHkgPSBtYXRyaXhbMTNdO1xuICAgICAgICB6ID0gbWF0cml4WzE0XTtcbiAgICAgICAgYW5nbGUgPSBfYXRhbjIoYTMyLCBhMzMpO1xuICAgICAgICByb3RhdGlvblggPSBhbmdsZSAqIF9SQUQyREVHO1xuXG4gICAgICAgIGlmIChhbmdsZSkge1xuICAgICAgICAgIGNvcyA9IE1hdGguY29zKC1hbmdsZSk7XG4gICAgICAgICAgc2luID0gTWF0aC5zaW4oLWFuZ2xlKTtcbiAgICAgICAgICB0MSA9IGExMiAqIGNvcyArIGExMyAqIHNpbjtcbiAgICAgICAgICB0MiA9IGEyMiAqIGNvcyArIGEyMyAqIHNpbjtcbiAgICAgICAgICB0MyA9IGEzMiAqIGNvcyArIGEzMyAqIHNpbjtcbiAgICAgICAgICBhMTMgPSBhMTIgKiAtc2luICsgYTEzICogY29zO1xuICAgICAgICAgIGEyMyA9IGEyMiAqIC1zaW4gKyBhMjMgKiBjb3M7XG4gICAgICAgICAgYTMzID0gYTMyICogLXNpbiArIGEzMyAqIGNvcztcbiAgICAgICAgICBhNDMgPSBhNDIgKiAtc2luICsgYTQzICogY29zO1xuICAgICAgICAgIGExMiA9IHQxO1xuICAgICAgICAgIGEyMiA9IHQyO1xuICAgICAgICAgIGEzMiA9IHQzO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5nbGUgPSBfYXRhbjIoLWMsIGEzMyk7XG4gICAgICAgIHJvdGF0aW9uWSA9IGFuZ2xlICogX1JBRDJERUc7XG5cbiAgICAgICAgaWYgKGFuZ2xlKSB7XG4gICAgICAgICAgY29zID0gTWF0aC5jb3MoLWFuZ2xlKTtcbiAgICAgICAgICBzaW4gPSBNYXRoLnNpbigtYW5nbGUpO1xuICAgICAgICAgIHQxID0gYSAqIGNvcyAtIGExMyAqIHNpbjtcbiAgICAgICAgICB0MiA9IGIgKiBjb3MgLSBhMjMgKiBzaW47XG4gICAgICAgICAgdDMgPSBjICogY29zIC0gYTMzICogc2luO1xuICAgICAgICAgIGE0MyA9IGQgKiBzaW4gKyBhNDMgKiBjb3M7XG4gICAgICAgICAgYSA9IHQxO1xuICAgICAgICAgIGIgPSB0MjtcbiAgICAgICAgICBjID0gdDM7XG4gICAgICAgIH1cblxuICAgICAgICBhbmdsZSA9IF9hdGFuMihiLCBhKTtcbiAgICAgICAgcm90YXRpb24gPSBhbmdsZSAqIF9SQUQyREVHO1xuXG4gICAgICAgIGlmIChhbmdsZSkge1xuICAgICAgICAgIGNvcyA9IE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgdDEgPSBhICogY29zICsgYiAqIHNpbjtcbiAgICAgICAgICB0MiA9IGExMiAqIGNvcyArIGEyMiAqIHNpbjtcbiAgICAgICAgICBiID0gYiAqIGNvcyAtIGEgKiBzaW47XG4gICAgICAgICAgYTIyID0gYTIyICogY29zIC0gYTEyICogc2luO1xuICAgICAgICAgIGEgPSB0MTtcbiAgICAgICAgICBhMTIgPSB0MjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3RhdGlvblggJiYgTWF0aC5hYnMocm90YXRpb25YKSArIE1hdGguYWJzKHJvdGF0aW9uKSA+IDM1OS45KSB7XG4gICAgICAgICAgcm90YXRpb25YID0gcm90YXRpb24gPSAwO1xuICAgICAgICAgIHJvdGF0aW9uWSA9IDE4MCAtIHJvdGF0aW9uWTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlWCA9IF9yb3VuZChNYXRoLnNxcnQoYSAqIGEgKyBiICogYiArIGMgKiBjKSk7XG4gICAgICAgIHNjYWxlWSA9IF9yb3VuZChNYXRoLnNxcnQoYTIyICogYTIyICsgYTMyICogYTMyKSk7XG4gICAgICAgIGFuZ2xlID0gX2F0YW4yKGExMiwgYTIyKTtcbiAgICAgICAgc2tld1ggPSBNYXRoLmFicyhhbmdsZSkgPiAwLjAwMDIgPyBhbmdsZSAqIF9SQUQyREVHIDogMDtcbiAgICAgICAgcGVyc3BlY3RpdmUgPSBhNDMgPyAxIC8gKGE0MyA8IDAgPyAtYTQzIDogYTQzKSA6IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChjYWNoZS5zdmcpIHtcbiAgICAgICAgdDEgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuICAgICAgICBjYWNoZS5mb3JjZUNTUyA9IHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgXCJcIikgfHwgIV9pc051bGxUcmFuc2Zvcm0oX2dldENvbXB1dGVkUHJvcGVydHkodGFyZ2V0LCBfdHJhbnNmb3JtUHJvcCkpO1xuICAgICAgICB0MSAmJiB0YXJnZXQuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHQxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoTWF0aC5hYnMoc2tld1gpID4gOTAgJiYgTWF0aC5hYnMoc2tld1gpIDwgMjcwKSB7XG4gICAgICBpZiAoaW52ZXJ0ZWRTY2FsZVgpIHtcbiAgICAgICAgc2NhbGVYICo9IC0xO1xuICAgICAgICBza2V3WCArPSByb3RhdGlvbiA8PSAwID8gMTgwIDogLTE4MDtcbiAgICAgICAgcm90YXRpb24gKz0gcm90YXRpb24gPD0gMCA/IDE4MCA6IC0xODA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY2FsZVkgKj0gLTE7XG4gICAgICAgIHNrZXdYICs9IHNrZXdYIDw9IDAgPyAxODAgOiAtMTgwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhY2hlLnggPSB4IC0gKChjYWNoZS54UGVyY2VudCA9IHggJiYgKGNhY2hlLnhQZXJjZW50IHx8IChNYXRoLnJvdW5kKHRhcmdldC5vZmZzZXRXaWR0aCAvIDIpID09PSBNYXRoLnJvdW5kKC14KSA/IC01MCA6IDApKSkgPyB0YXJnZXQub2Zmc2V0V2lkdGggKiBjYWNoZS54UGVyY2VudCAvIDEwMCA6IDApICsgcHg7XG4gICAgY2FjaGUueSA9IHkgLSAoKGNhY2hlLnlQZXJjZW50ID0geSAmJiAoY2FjaGUueVBlcmNlbnQgfHwgKE1hdGgucm91bmQodGFyZ2V0Lm9mZnNldEhlaWdodCAvIDIpID09PSBNYXRoLnJvdW5kKC15KSA/IC01MCA6IDApKSkgPyB0YXJnZXQub2Zmc2V0SGVpZ2h0ICogY2FjaGUueVBlcmNlbnQgLyAxMDAgOiAwKSArIHB4O1xuICAgIGNhY2hlLnogPSB6ICsgcHg7XG4gICAgY2FjaGUuc2NhbGVYID0gX3JvdW5kKHNjYWxlWCk7XG4gICAgY2FjaGUuc2NhbGVZID0gX3JvdW5kKHNjYWxlWSk7XG4gICAgY2FjaGUucm90YXRpb24gPSBfcm91bmQocm90YXRpb24pICsgZGVnO1xuICAgIGNhY2hlLnJvdGF0aW9uWCA9IF9yb3VuZChyb3RhdGlvblgpICsgZGVnO1xuICAgIGNhY2hlLnJvdGF0aW9uWSA9IF9yb3VuZChyb3RhdGlvblkpICsgZGVnO1xuICAgIGNhY2hlLnNrZXdYID0gc2tld1ggKyBkZWc7XG4gICAgY2FjaGUuc2tld1kgPSBza2V3WSArIGRlZztcbiAgICBjYWNoZS50cmFuc2Zvcm1QZXJzcGVjdGl2ZSA9IHBlcnNwZWN0aXZlICsgcHg7XG5cbiAgICBpZiAoY2FjaGUuek9yaWdpbiA9IHBhcnNlRmxvYXQob3JpZ2luLnNwbGl0KFwiIFwiKVsyXSkgfHwgMCkge1xuICAgICAgc3R5bGVbX3RyYW5zZm9ybU9yaWdpblByb3BdID0gX2ZpcnN0VHdvT25seShvcmlnaW4pO1xuICAgIH1cblxuICAgIGNhY2hlLnhPZmZzZXQgPSBjYWNoZS55T2Zmc2V0ID0gMDtcbiAgICBjYWNoZS5mb3JjZTNEID0gX2NvbmZpZy5mb3JjZTNEO1xuICAgIGNhY2hlLnJlbmRlclRyYW5zZm9ybSA9IGNhY2hlLnN2ZyA/IF9yZW5kZXJTVkdUcmFuc2Zvcm1zIDogX3N1cHBvcnRzM0QgPyBfcmVuZGVyQ1NTVHJhbnNmb3JtcyA6IF9yZW5kZXJOb24zRFRyYW5zZm9ybXM7XG4gICAgY2FjaGUudW5jYWNoZSA9IDA7XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9LFxuICAgICAgX2ZpcnN0VHdvT25seSA9IGZ1bmN0aW9uIF9maXJzdFR3b09ubHkodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlID0gdmFsdWUuc3BsaXQoXCIgXCIpKVswXSArIFwiIFwiICsgdmFsdWVbMV07XG4gIH0sXG4gICAgICBfYWRkUHhUcmFuc2xhdGUgPSBmdW5jdGlvbiBfYWRkUHhUcmFuc2xhdGUodGFyZ2V0LCBzdGFydCwgdmFsdWUpIHtcbiAgICB2YXIgdW5pdCA9IGdldFVuaXQoc3RhcnQpO1xuICAgIHJldHVybiBfcm91bmQocGFyc2VGbG9hdChzdGFydCkgKyBwYXJzZUZsb2F0KF9jb252ZXJ0VG9Vbml0KHRhcmdldCwgXCJ4XCIsIHZhbHVlICsgXCJweFwiLCB1bml0KSkpICsgdW5pdDtcbiAgfSxcbiAgICAgIF9yZW5kZXJOb24zRFRyYW5zZm9ybXMgPSBmdW5jdGlvbiBfcmVuZGVyTm9uM0RUcmFuc2Zvcm1zKHJhdGlvLCBjYWNoZSkge1xuICAgIGNhY2hlLnogPSBcIjBweFwiO1xuICAgIGNhY2hlLnJvdGF0aW9uWSA9IGNhY2hlLnJvdGF0aW9uWCA9IFwiMGRlZ1wiO1xuICAgIGNhY2hlLmZvcmNlM0QgPSAwO1xuXG4gICAgX3JlbmRlckNTU1RyYW5zZm9ybXMocmF0aW8sIGNhY2hlKTtcbiAgfSxcbiAgICAgIF96ZXJvRGVnID0gXCIwZGVnXCIsXG4gICAgICBfemVyb1B4ID0gXCIwcHhcIixcbiAgICAgIF9lbmRQYXJlbnRoZXNpcyA9IFwiKSBcIixcbiAgICAgIF9yZW5kZXJDU1NUcmFuc2Zvcm1zID0gZnVuY3Rpb24gX3JlbmRlckNTU1RyYW5zZm9ybXMocmF0aW8sIGNhY2hlKSB7XG4gICAgdmFyIF9yZWYgPSBjYWNoZSB8fCB0aGlzLFxuICAgICAgICB4UGVyY2VudCA9IF9yZWYueFBlcmNlbnQsXG4gICAgICAgIHlQZXJjZW50ID0gX3JlZi55UGVyY2VudCxcbiAgICAgICAgeCA9IF9yZWYueCxcbiAgICAgICAgeSA9IF9yZWYueSxcbiAgICAgICAgeiA9IF9yZWYueixcbiAgICAgICAgcm90YXRpb24gPSBfcmVmLnJvdGF0aW9uLFxuICAgICAgICByb3RhdGlvblkgPSBfcmVmLnJvdGF0aW9uWSxcbiAgICAgICAgcm90YXRpb25YID0gX3JlZi5yb3RhdGlvblgsXG4gICAgICAgIHNrZXdYID0gX3JlZi5za2V3WCxcbiAgICAgICAgc2tld1kgPSBfcmVmLnNrZXdZLFxuICAgICAgICBzY2FsZVggPSBfcmVmLnNjYWxlWCxcbiAgICAgICAgc2NhbGVZID0gX3JlZi5zY2FsZVksXG4gICAgICAgIHRyYW5zZm9ybVBlcnNwZWN0aXZlID0gX3JlZi50cmFuc2Zvcm1QZXJzcGVjdGl2ZSxcbiAgICAgICAgZm9yY2UzRCA9IF9yZWYuZm9yY2UzRCxcbiAgICAgICAgdGFyZ2V0ID0gX3JlZi50YXJnZXQsXG4gICAgICAgIHpPcmlnaW4gPSBfcmVmLnpPcmlnaW4sXG4gICAgICAgIHRyYW5zZm9ybXMgPSBcIlwiLFxuICAgICAgICB1c2UzRCA9IGZvcmNlM0QgPT09IFwiYXV0b1wiICYmIHJhdGlvICYmIHJhdGlvICE9PSAxIHx8IGZvcmNlM0QgPT09IHRydWU7XG5cbiAgICBpZiAoek9yaWdpbiAmJiAocm90YXRpb25YICE9PSBfemVyb0RlZyB8fCByb3RhdGlvblkgIT09IF96ZXJvRGVnKSkge1xuICAgICAgdmFyIGFuZ2xlID0gcGFyc2VGbG9hdChyb3RhdGlvblkpICogX0RFRzJSQUQsXG4gICAgICAgICAgYTEzID0gTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgIGEzMyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICBjb3M7XG5cbiAgICAgIGFuZ2xlID0gcGFyc2VGbG9hdChyb3RhdGlvblgpICogX0RFRzJSQUQ7XG4gICAgICBjb3MgPSBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICB4ID0gX2FkZFB4VHJhbnNsYXRlKHRhcmdldCwgeCwgYTEzICogY29zICogLXpPcmlnaW4pO1xuICAgICAgeSA9IF9hZGRQeFRyYW5zbGF0ZSh0YXJnZXQsIHksIC1NYXRoLnNpbihhbmdsZSkgKiAtek9yaWdpbik7XG4gICAgICB6ID0gX2FkZFB4VHJhbnNsYXRlKHRhcmdldCwgeiwgYTMzICogY29zICogLXpPcmlnaW4gKyB6T3JpZ2luKTtcbiAgICB9XG5cbiAgICBpZiAodHJhbnNmb3JtUGVyc3BlY3RpdmUgIT09IF96ZXJvUHgpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0gXCJwZXJzcGVjdGl2ZShcIiArIHRyYW5zZm9ybVBlcnNwZWN0aXZlICsgX2VuZFBhcmVudGhlc2lzO1xuICAgIH1cblxuICAgIGlmICh4UGVyY2VudCB8fCB5UGVyY2VudCkge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInRyYW5zbGF0ZShcIiArIHhQZXJjZW50ICsgXCIlLCBcIiArIHlQZXJjZW50ICsgXCIlKSBcIjtcbiAgICB9XG5cbiAgICBpZiAodXNlM0QgfHwgeCAhPT0gX3plcm9QeCB8fCB5ICE9PSBfemVyb1B4IHx8IHogIT09IF96ZXJvUHgpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0geiAhPT0gX3plcm9QeCB8fCB1c2UzRCA/IFwidHJhbnNsYXRlM2QoXCIgKyB4ICsgXCIsIFwiICsgeSArIFwiLCBcIiArIHogKyBcIikgXCIgOiBcInRyYW5zbGF0ZShcIiArIHggKyBcIiwgXCIgKyB5ICsgX2VuZFBhcmVudGhlc2lzO1xuICAgIH1cblxuICAgIGlmIChyb3RhdGlvbiAhPT0gX3plcm9EZWcpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0gXCJyb3RhdGUoXCIgKyByb3RhdGlvbiArIF9lbmRQYXJlbnRoZXNpcztcbiAgICB9XG5cbiAgICBpZiAocm90YXRpb25ZICE9PSBfemVyb0RlZykge1xuICAgICAgdHJhbnNmb3JtcyArPSBcInJvdGF0ZVkoXCIgKyByb3RhdGlvblkgKyBfZW5kUGFyZW50aGVzaXM7XG4gICAgfVxuXG4gICAgaWYgKHJvdGF0aW9uWCAhPT0gX3plcm9EZWcpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0gXCJyb3RhdGVYKFwiICsgcm90YXRpb25YICsgX2VuZFBhcmVudGhlc2lzO1xuICAgIH1cblxuICAgIGlmIChza2V3WCAhPT0gX3plcm9EZWcgfHwgc2tld1kgIT09IF96ZXJvRGVnKSB7XG4gICAgICB0cmFuc2Zvcm1zICs9IFwic2tldyhcIiArIHNrZXdYICsgXCIsIFwiICsgc2tld1kgKyBfZW5kUGFyZW50aGVzaXM7XG4gICAgfVxuXG4gICAgaWYgKHNjYWxlWCAhPT0gMSB8fCBzY2FsZVkgIT09IDEpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0gXCJzY2FsZShcIiArIHNjYWxlWCArIFwiLCBcIiArIHNjYWxlWSArIF9lbmRQYXJlbnRoZXNpcztcbiAgICB9XG5cbiAgICB0YXJnZXQuc3R5bGVbX3RyYW5zZm9ybVByb3BdID0gdHJhbnNmb3JtcyB8fCBcInRyYW5zbGF0ZSgwLCAwKVwiO1xuICB9LFxuICAgICAgX3JlbmRlclNWR1RyYW5zZm9ybXMgPSBmdW5jdGlvbiBfcmVuZGVyU1ZHVHJhbnNmb3JtcyhyYXRpbywgY2FjaGUpIHtcbiAgICB2YXIgX3JlZjIgPSBjYWNoZSB8fCB0aGlzLFxuICAgICAgICB4UGVyY2VudCA9IF9yZWYyLnhQZXJjZW50LFxuICAgICAgICB5UGVyY2VudCA9IF9yZWYyLnlQZXJjZW50LFxuICAgICAgICB4ID0gX3JlZjIueCxcbiAgICAgICAgeSA9IF9yZWYyLnksXG4gICAgICAgIHJvdGF0aW9uID0gX3JlZjIucm90YXRpb24sXG4gICAgICAgIHNrZXdYID0gX3JlZjIuc2tld1gsXG4gICAgICAgIHNrZXdZID0gX3JlZjIuc2tld1ksXG4gICAgICAgIHNjYWxlWCA9IF9yZWYyLnNjYWxlWCxcbiAgICAgICAgc2NhbGVZID0gX3JlZjIuc2NhbGVZLFxuICAgICAgICB0YXJnZXQgPSBfcmVmMi50YXJnZXQsXG4gICAgICAgIHhPcmlnaW4gPSBfcmVmMi54T3JpZ2luLFxuICAgICAgICB5T3JpZ2luID0gX3JlZjIueU9yaWdpbixcbiAgICAgICAgeE9mZnNldCA9IF9yZWYyLnhPZmZzZXQsXG4gICAgICAgIHlPZmZzZXQgPSBfcmVmMi55T2Zmc2V0LFxuICAgICAgICBmb3JjZUNTUyA9IF9yZWYyLmZvcmNlQ1NTLFxuICAgICAgICB0eCA9IHBhcnNlRmxvYXQoeCksXG4gICAgICAgIHR5ID0gcGFyc2VGbG9hdCh5KSxcbiAgICAgICAgYTExLFxuICAgICAgICBhMjEsXG4gICAgICAgIGExMixcbiAgICAgICAgYTIyLFxuICAgICAgICB0ZW1wO1xuXG4gICAgcm90YXRpb24gPSBwYXJzZUZsb2F0KHJvdGF0aW9uKTtcbiAgICBza2V3WCA9IHBhcnNlRmxvYXQoc2tld1gpO1xuICAgIHNrZXdZID0gcGFyc2VGbG9hdChza2V3WSk7XG5cbiAgICBpZiAoc2tld1kpIHtcbiAgICAgIHNrZXdZID0gcGFyc2VGbG9hdChza2V3WSk7XG4gICAgICBza2V3WCArPSBza2V3WTtcbiAgICAgIHJvdGF0aW9uICs9IHNrZXdZO1xuICAgIH1cblxuICAgIGlmIChyb3RhdGlvbiB8fCBza2V3WCkge1xuICAgICAgcm90YXRpb24gKj0gX0RFRzJSQUQ7XG4gICAgICBza2V3WCAqPSBfREVHMlJBRDtcbiAgICAgIGExMSA9IE1hdGguY29zKHJvdGF0aW9uKSAqIHNjYWxlWDtcbiAgICAgIGEyMSA9IE1hdGguc2luKHJvdGF0aW9uKSAqIHNjYWxlWDtcbiAgICAgIGExMiA9IE1hdGguc2luKHJvdGF0aW9uIC0gc2tld1gpICogLXNjYWxlWTtcbiAgICAgIGEyMiA9IE1hdGguY29zKHJvdGF0aW9uIC0gc2tld1gpICogc2NhbGVZO1xuXG4gICAgICBpZiAoc2tld1gpIHtcbiAgICAgICAgc2tld1kgKj0gX0RFRzJSQUQ7XG4gICAgICAgIHRlbXAgPSBNYXRoLnRhbihza2V3WCAtIHNrZXdZKTtcbiAgICAgICAgdGVtcCA9IE1hdGguc3FydCgxICsgdGVtcCAqIHRlbXApO1xuICAgICAgICBhMTIgKj0gdGVtcDtcbiAgICAgICAgYTIyICo9IHRlbXA7XG5cbiAgICAgICAgaWYgKHNrZXdZKSB7XG4gICAgICAgICAgdGVtcCA9IE1hdGgudGFuKHNrZXdZKTtcbiAgICAgICAgICB0ZW1wID0gTWF0aC5zcXJ0KDEgKyB0ZW1wICogdGVtcCk7XG4gICAgICAgICAgYTExICo9IHRlbXA7XG4gICAgICAgICAgYTIxICo9IHRlbXA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYTExID0gX3JvdW5kKGExMSk7XG4gICAgICBhMjEgPSBfcm91bmQoYTIxKTtcbiAgICAgIGExMiA9IF9yb3VuZChhMTIpO1xuICAgICAgYTIyID0gX3JvdW5kKGEyMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGExMSA9IHNjYWxlWDtcbiAgICAgIGEyMiA9IHNjYWxlWTtcbiAgICAgIGEyMSA9IGExMiA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHR4ICYmICF+KHggKyBcIlwiKS5pbmRleE9mKFwicHhcIikgfHwgdHkgJiYgIX4oeSArIFwiXCIpLmluZGV4T2YoXCJweFwiKSkge1xuICAgICAgdHggPSBfY29udmVydFRvVW5pdCh0YXJnZXQsIFwieFwiLCB4LCBcInB4XCIpO1xuICAgICAgdHkgPSBfY29udmVydFRvVW5pdCh0YXJnZXQsIFwieVwiLCB5LCBcInB4XCIpO1xuICAgIH1cblxuICAgIGlmICh4T3JpZ2luIHx8IHlPcmlnaW4gfHwgeE9mZnNldCB8fCB5T2Zmc2V0KSB7XG4gICAgICB0eCA9IF9yb3VuZCh0eCArIHhPcmlnaW4gLSAoeE9yaWdpbiAqIGExMSArIHlPcmlnaW4gKiBhMTIpICsgeE9mZnNldCk7XG4gICAgICB0eSA9IF9yb3VuZCh0eSArIHlPcmlnaW4gLSAoeE9yaWdpbiAqIGEyMSArIHlPcmlnaW4gKiBhMjIpICsgeU9mZnNldCk7XG4gICAgfVxuXG4gICAgaWYgKHhQZXJjZW50IHx8IHlQZXJjZW50KSB7XG4gICAgICB0ZW1wID0gdGFyZ2V0LmdldEJCb3goKTtcbiAgICAgIHR4ID0gX3JvdW5kKHR4ICsgeFBlcmNlbnQgLyAxMDAgKiB0ZW1wLndpZHRoKTtcbiAgICAgIHR5ID0gX3JvdW5kKHR5ICsgeVBlcmNlbnQgLyAxMDAgKiB0ZW1wLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGVtcCA9IFwibWF0cml4KFwiICsgYTExICsgXCIsXCIgKyBhMjEgKyBcIixcIiArIGExMiArIFwiLFwiICsgYTIyICsgXCIsXCIgKyB0eCArIFwiLFwiICsgdHkgKyBcIilcIjtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHRlbXApO1xuICAgIGZvcmNlQ1NTICYmICh0YXJnZXQuc3R5bGVbX3RyYW5zZm9ybVByb3BdID0gdGVtcCk7XG4gIH0sXG4gICAgICBfYWRkUm90YXRpb25hbFByb3BUd2VlbiA9IGZ1bmN0aW9uIF9hZGRSb3RhdGlvbmFsUHJvcFR3ZWVuKHBsdWdpbiwgdGFyZ2V0LCBwcm9wZXJ0eSwgc3RhcnROdW0sIGVuZFZhbHVlLCByZWxhdGl2ZSkge1xuICAgIHZhciBjYXAgPSAzNjAsXG4gICAgICAgIGlzU3RyaW5nID0gX2lzU3RyaW5nKGVuZFZhbHVlKSxcbiAgICAgICAgZW5kTnVtID0gcGFyc2VGbG9hdChlbmRWYWx1ZSkgKiAoaXNTdHJpbmcgJiYgfmVuZFZhbHVlLmluZGV4T2YoXCJyYWRcIikgPyBfUkFEMkRFRyA6IDEpLFxuICAgICAgICBjaGFuZ2UgPSByZWxhdGl2ZSA/IGVuZE51bSAqIHJlbGF0aXZlIDogZW5kTnVtIC0gc3RhcnROdW0sXG4gICAgICAgIGZpbmFsVmFsdWUgPSBzdGFydE51bSArIGNoYW5nZSArIFwiZGVnXCIsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgcHQ7XG5cbiAgICBpZiAoaXNTdHJpbmcpIHtcbiAgICAgIGRpcmVjdGlvbiA9IGVuZFZhbHVlLnNwbGl0KFwiX1wiKVsxXTtcblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJzaG9ydFwiKSB7XG4gICAgICAgIGNoYW5nZSAlPSBjYXA7XG5cbiAgICAgICAgaWYgKGNoYW5nZSAhPT0gY2hhbmdlICUgKGNhcCAvIDIpKSB7XG4gICAgICAgICAgY2hhbmdlICs9IGNoYW5nZSA8IDAgPyBjYXAgOiAtY2FwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwiY3dcIiAmJiBjaGFuZ2UgPCAwKSB7XG4gICAgICAgIGNoYW5nZSA9IChjaGFuZ2UgKyBjYXAgKiBfYmlnTnVtJDEpICUgY2FwIC0gfn4oY2hhbmdlIC8gY2FwKSAqIGNhcDtcbiAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBcImNjd1wiICYmIGNoYW5nZSA+IDApIHtcbiAgICAgICAgY2hhbmdlID0gKGNoYW5nZSAtIGNhcCAqIF9iaWdOdW0kMSkgJSBjYXAgLSB+fihjaGFuZ2UgLyBjYXApICogY2FwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBsdWdpbi5fcHQgPSBwdCA9IG5ldyBQcm9wVHdlZW4ocGx1Z2luLl9wdCwgdGFyZ2V0LCBwcm9wZXJ0eSwgc3RhcnROdW0sIGNoYW5nZSwgX3JlbmRlclByb3BXaXRoRW5kKTtcbiAgICBwdC5lID0gZmluYWxWYWx1ZTtcbiAgICBwdC51ID0gXCJkZWdcIjtcblxuICAgIHBsdWdpbi5fcHJvcHMucHVzaChwcm9wZXJ0eSk7XG5cbiAgICByZXR1cm4gcHQ7XG4gIH0sXG4gICAgICBfYXNzaWduID0gZnVuY3Rpb24gX2Fzc2lnbih0YXJnZXQsIHNvdXJjZSkge1xuICAgIGZvciAodmFyIHAgaW4gc291cmNlKSB7XG4gICAgICB0YXJnZXRbcF0gPSBzb3VyY2VbcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfSxcbiAgICAgIF9hZGRSYXdUcmFuc2Zvcm1QVHMgPSBmdW5jdGlvbiBfYWRkUmF3VHJhbnNmb3JtUFRzKHBsdWdpbiwgdHJhbnNmb3JtcywgdGFyZ2V0KSB7XG4gICAgdmFyIHN0YXJ0Q2FjaGUgPSBfYXNzaWduKHt9LCB0YXJnZXQuX2dzYXApLFxuICAgICAgICBleGNsdWRlID0gXCJwZXJzcGVjdGl2ZSxmb3JjZTNELHRyYW5zZm9ybU9yaWdpbixzdmdPcmlnaW5cIixcbiAgICAgICAgc3R5bGUgPSB0YXJnZXQuc3R5bGUsXG4gICAgICAgIGVuZENhY2hlLFxuICAgICAgICBwLFxuICAgICAgICBzdGFydFZhbHVlLFxuICAgICAgICBlbmRWYWx1ZSxcbiAgICAgICAgc3RhcnROdW0sXG4gICAgICAgIGVuZE51bSxcbiAgICAgICAgc3RhcnRVbml0LFxuICAgICAgICBlbmRVbml0O1xuXG4gICAgaWYgKHN0YXJ0Q2FjaGUuc3ZnKSB7XG4gICAgICBzdGFydFZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgXCJcIik7XG4gICAgICBzdHlsZVtfdHJhbnNmb3JtUHJvcF0gPSB0cmFuc2Zvcm1zO1xuICAgICAgZW5kQ2FjaGUgPSBfcGFyc2VUcmFuc2Zvcm0odGFyZ2V0LCAxKTtcblxuICAgICAgX3JlbW92ZVByb3BlcnR5KHRhcmdldCwgX3RyYW5zZm9ybVByb3ApO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHN0YXJ0VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydFZhbHVlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpW190cmFuc2Zvcm1Qcm9wXTtcbiAgICAgIHN0eWxlW190cmFuc2Zvcm1Qcm9wXSA9IHRyYW5zZm9ybXM7XG4gICAgICBlbmRDYWNoZSA9IF9wYXJzZVRyYW5zZm9ybSh0YXJnZXQsIDEpO1xuICAgICAgc3R5bGVbX3RyYW5zZm9ybVByb3BdID0gc3RhcnRWYWx1ZTtcbiAgICB9XG5cbiAgICBmb3IgKHAgaW4gX3RyYW5zZm9ybVByb3BzKSB7XG4gICAgICBzdGFydFZhbHVlID0gc3RhcnRDYWNoZVtwXTtcbiAgICAgIGVuZFZhbHVlID0gZW5kQ2FjaGVbcF07XG5cbiAgICAgIGlmIChzdGFydFZhbHVlICE9PSBlbmRWYWx1ZSAmJiBleGNsdWRlLmluZGV4T2YocCkgPCAwKSB7XG4gICAgICAgIHN0YXJ0VW5pdCA9IGdldFVuaXQoc3RhcnRWYWx1ZSk7XG4gICAgICAgIGVuZFVuaXQgPSBnZXRVbml0KGVuZFZhbHVlKTtcbiAgICAgICAgc3RhcnROdW0gPSBzdGFydFVuaXQgIT09IGVuZFVuaXQgPyBfY29udmVydFRvVW5pdCh0YXJnZXQsIHAsIHN0YXJ0VmFsdWUsIGVuZFVuaXQpIDogcGFyc2VGbG9hdChzdGFydFZhbHVlKTtcbiAgICAgICAgZW5kTnVtID0gcGFyc2VGbG9hdChlbmRWYWx1ZSk7XG4gICAgICAgIHBsdWdpbi5fcHQgPSBuZXcgUHJvcFR3ZWVuKHBsdWdpbi5fcHQsIGVuZENhY2hlLCBwLCBzdGFydE51bSwgZW5kTnVtIC0gc3RhcnROdW0sIF9yZW5kZXJDU1NQcm9wKTtcbiAgICAgICAgcGx1Z2luLl9wdC51ID0gZW5kVW5pdCB8fCAwO1xuXG4gICAgICAgIHBsdWdpbi5fcHJvcHMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfYXNzaWduKGVuZENhY2hlLCBzdGFydENhY2hlKTtcbiAgfTtcblxuICBfZm9yRWFjaE5hbWUoXCJwYWRkaW5nLG1hcmdpbixXaWR0aCxSYWRpdXNcIiwgZnVuY3Rpb24gKG5hbWUsIGluZGV4KSB7XG4gICAgdmFyIHQgPSBcIlRvcFwiLFxuICAgICAgICByID0gXCJSaWdodFwiLFxuICAgICAgICBiID0gXCJCb3R0b21cIixcbiAgICAgICAgbCA9IFwiTGVmdFwiLFxuICAgICAgICBwcm9wcyA9IChpbmRleCA8IDMgPyBbdCwgciwgYiwgbF0gOiBbdCArIGwsIHQgKyByLCBiICsgciwgYiArIGxdKS5tYXAoZnVuY3Rpb24gKHNpZGUpIHtcbiAgICAgIHJldHVybiBpbmRleCA8IDIgPyBuYW1lICsgc2lkZSA6IFwiYm9yZGVyXCIgKyBzaWRlICsgbmFtZTtcbiAgICB9KTtcblxuICAgIF9zcGVjaWFsUHJvcHNbaW5kZXggPiAxID8gXCJib3JkZXJcIiArIG5hbWUgOiBuYW1lXSA9IGZ1bmN0aW9uIChwbHVnaW4sIHRhcmdldCwgcHJvcGVydHksIGVuZFZhbHVlLCB0d2Vlbikge1xuICAgICAgdmFyIGEsIHZhcnM7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgNCkge1xuICAgICAgICBhID0gcHJvcHMubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIF9nZXQocGx1Z2luLCBwcm9wLCBwcm9wZXJ0eSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXJzID0gYS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHZhcnMuc3BsaXQoYVswXSkubGVuZ3RoID09PSA1ID8gYVswXSA6IHZhcnM7XG4gICAgICB9XG5cbiAgICAgIGEgPSAoZW5kVmFsdWUgKyBcIlwiKS5zcGxpdChcIiBcIik7XG4gICAgICB2YXJzID0ge307XG4gICAgICBwcm9wcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wLCBpKSB7XG4gICAgICAgIHJldHVybiB2YXJzW3Byb3BdID0gYVtpXSA9IGFbaV0gfHwgYVsoaSAtIDEpIC8gMiB8IDBdO1xuICAgICAgfSk7XG4gICAgICBwbHVnaW4uaW5pdCh0YXJnZXQsIHZhcnMsIHR3ZWVuKTtcbiAgICB9O1xuICB9KTtcblxuICB2YXIgQ1NTUGx1Z2luID0ge1xuICAgIG5hbWU6IFwiY3NzXCIsXG4gICAgcmVnaXN0ZXI6IF9pbml0Q29yZSxcbiAgICB0YXJnZXRUZXN0OiBmdW5jdGlvbiB0YXJnZXRUZXN0KHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRhcmdldC5zdHlsZSAmJiB0YXJnZXQubm9kZVR5cGU7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHRhcmdldCwgdmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXRzKSB7XG4gICAgICB2YXIgcHJvcHMgPSB0aGlzLl9wcm9wcyxcbiAgICAgICAgICBzdHlsZSA9IHRhcmdldC5zdHlsZSxcbiAgICAgICAgICBzdGFydEF0ID0gdHdlZW4udmFycy5zdGFydEF0LFxuICAgICAgICAgIHN0YXJ0VmFsdWUsXG4gICAgICAgICAgZW5kVmFsdWUsXG4gICAgICAgICAgZW5kTnVtLFxuICAgICAgICAgIHN0YXJ0TnVtLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgc3BlY2lhbFByb3AsXG4gICAgICAgICAgcCxcbiAgICAgICAgICBzdGFydFVuaXQsXG4gICAgICAgICAgZW5kVW5pdCxcbiAgICAgICAgICByZWxhdGl2ZSxcbiAgICAgICAgICBpc1RyYW5zZm9ybVJlbGF0ZWQsXG4gICAgICAgICAgdHJhbnNmb3JtUHJvcFR3ZWVuLFxuICAgICAgICAgIGNhY2hlLFxuICAgICAgICAgIHNtb290aCxcbiAgICAgICAgICBoYXNQcmlvcml0eTtcbiAgICAgIF9wbHVnaW5Jbml0dGVkIHx8IF9pbml0Q29yZSgpO1xuXG4gICAgICBmb3IgKHAgaW4gdmFycykge1xuICAgICAgICBpZiAocCA9PT0gXCJhdXRvUm91bmRcIikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZW5kVmFsdWUgPSB2YXJzW3BdO1xuXG4gICAgICAgIGlmIChfcGx1Z2luc1twXSAmJiBfY2hlY2tQbHVnaW4ocCwgdmFycywgdHdlZW4sIGluZGV4LCB0YXJnZXQsIHRhcmdldHMpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0eXBlID0gdHlwZW9mIGVuZFZhbHVlO1xuICAgICAgICBzcGVjaWFsUHJvcCA9IF9zcGVjaWFsUHJvcHNbcF07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGVuZFZhbHVlID0gZW5kVmFsdWUuY2FsbCh0d2VlbiwgaW5kZXgsIHRhcmdldCwgdGFyZ2V0cyk7XG4gICAgICAgICAgdHlwZSA9IHR5cGVvZiBlbmRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlID09PSBcInN0cmluZ1wiICYmIH5lbmRWYWx1ZS5pbmRleE9mKFwicmFuZG9tKFwiKSkge1xuICAgICAgICAgIGVuZFZhbHVlID0gX3JlcGxhY2VSYW5kb20oZW5kVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwZWNpYWxQcm9wKSB7XG4gICAgICAgICAgc3BlY2lhbFByb3AodGhpcywgdGFyZ2V0LCBwLCBlbmRWYWx1ZSwgdHdlZW4pICYmIChoYXNQcmlvcml0eSA9IDEpO1xuICAgICAgICB9IGVsc2UgaWYgKHAuc3Vic3RyKDAsIDIpID09PSBcIi0tXCIpIHtcbiAgICAgICAgICBzdGFydFZhbHVlID0gKGdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKHApICsgXCJcIikudHJpbSgpO1xuICAgICAgICAgIGVuZFZhbHVlICs9IFwiXCI7XG4gICAgICAgICAgX2NvbG9yRXhwLmxhc3RJbmRleCA9IDA7XG5cbiAgICAgICAgICBpZiAoIV9jb2xvckV4cC50ZXN0KHN0YXJ0VmFsdWUpKSB7XG4gICAgICAgICAgICBzdGFydFVuaXQgPSBnZXRVbml0KHN0YXJ0VmFsdWUpO1xuICAgICAgICAgICAgZW5kVW5pdCA9IGdldFVuaXQoZW5kVmFsdWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVuZFVuaXQgPyBzdGFydFVuaXQgIT09IGVuZFVuaXQgJiYgKHN0YXJ0VmFsdWUgPSBfY29udmVydFRvVW5pdCh0YXJnZXQsIHAsIHN0YXJ0VmFsdWUsIGVuZFVuaXQpICsgZW5kVW5pdCkgOiBzdGFydFVuaXQgJiYgKGVuZFZhbHVlICs9IHN0YXJ0VW5pdCk7XG4gICAgICAgICAgdGhpcy5hZGQoc3R5bGUsIFwic2V0UHJvcGVydHlcIiwgc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIGluZGV4LCB0YXJnZXRzLCAwLCAwLCBwKTtcbiAgICAgICAgICBwcm9wcy5wdXNoKHApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpZiAoc3RhcnRBdCAmJiBwIGluIHN0YXJ0QXQpIHtcbiAgICAgICAgICAgIHN0YXJ0VmFsdWUgPSB0eXBlb2Ygc3RhcnRBdFtwXSA9PT0gXCJmdW5jdGlvblwiID8gc3RhcnRBdFtwXS5jYWxsKHR3ZWVuLCBpbmRleCwgdGFyZ2V0LCB0YXJnZXRzKSA6IHN0YXJ0QXRbcF07XG4gICAgICAgICAgICBfaXNTdHJpbmcoc3RhcnRWYWx1ZSkgJiYgfnN0YXJ0VmFsdWUuaW5kZXhPZihcInJhbmRvbShcIikgJiYgKHN0YXJ0VmFsdWUgPSBfcmVwbGFjZVJhbmRvbShzdGFydFZhbHVlKSk7XG4gICAgICAgICAgICBnZXRVbml0KHN0YXJ0VmFsdWUgKyBcIlwiKSB8fCAoc3RhcnRWYWx1ZSArPSBfY29uZmlnLnVuaXRzW3BdIHx8IGdldFVuaXQoX2dldCh0YXJnZXQsIHApKSB8fCBcIlwiKTtcbiAgICAgICAgICAgIChzdGFydFZhbHVlICsgXCJcIikuY2hhckF0KDEpID09PSBcIj1cIiAmJiAoc3RhcnRWYWx1ZSA9IF9nZXQodGFyZ2V0LCBwKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0VmFsdWUgPSBfZ2V0KHRhcmdldCwgcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3RhcnROdW0gPSBwYXJzZUZsb2F0KHN0YXJ0VmFsdWUpO1xuICAgICAgICAgIHJlbGF0aXZlID0gdHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBlbmRWYWx1ZS5jaGFyQXQoMSkgPT09IFwiPVwiID8gKyhlbmRWYWx1ZS5jaGFyQXQoMCkgKyBcIjFcIikgOiAwO1xuICAgICAgICAgIHJlbGF0aXZlICYmIChlbmRWYWx1ZSA9IGVuZFZhbHVlLnN1YnN0cigyKSk7XG4gICAgICAgICAgZW5kTnVtID0gcGFyc2VGbG9hdChlbmRWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocCBpbiBfcHJvcGVydHlBbGlhc2VzKSB7XG4gICAgICAgICAgICBpZiAocCA9PT0gXCJhdXRvQWxwaGFcIikge1xuICAgICAgICAgICAgICBpZiAoc3RhcnROdW0gPT09IDEgJiYgX2dldCh0YXJnZXQsIFwidmlzaWJpbGl0eVwiKSA9PT0gXCJoaWRkZW5cIiAmJiBlbmROdW0pIHtcbiAgICAgICAgICAgICAgICBzdGFydE51bSA9IDA7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBfYWRkTm9uVHdlZW5pbmdQVCh0aGlzLCBzdHlsZSwgXCJ2aXNpYmlsaXR5XCIsIHN0YXJ0TnVtID8gXCJpbmhlcml0XCIgOiBcImhpZGRlblwiLCBlbmROdW0gPyBcImluaGVyaXRcIiA6IFwiaGlkZGVuXCIsICFlbmROdW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocCAhPT0gXCJzY2FsZVwiICYmIHAgIT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgICAgcCA9IF9wcm9wZXJ0eUFsaWFzZXNbcF07XG4gICAgICAgICAgICAgIH5wLmluZGV4T2YoXCIsXCIpICYmIChwID0gcC5zcGxpdChcIixcIilbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlzVHJhbnNmb3JtUmVsYXRlZCA9IHAgaW4gX3RyYW5zZm9ybVByb3BzO1xuXG4gICAgICAgICAgaWYgKGlzVHJhbnNmb3JtUmVsYXRlZCkge1xuICAgICAgICAgICAgaWYgKCF0cmFuc2Zvcm1Qcm9wVHdlZW4pIHtcbiAgICAgICAgICAgICAgY2FjaGUgPSB0YXJnZXQuX2dzYXA7XG4gICAgICAgICAgICAgIGNhY2hlLnJlbmRlclRyYW5zZm9ybSAmJiAhdmFycy5wYXJzZVRyYW5zZm9ybSB8fCBfcGFyc2VUcmFuc2Zvcm0odGFyZ2V0LCB2YXJzLnBhcnNlVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgc21vb3RoID0gdmFycy5zbW9vdGhPcmlnaW4gIT09IGZhbHNlICYmIGNhY2hlLnNtb290aDtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtUHJvcFR3ZWVuID0gdGhpcy5fcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCBzdHlsZSwgX3RyYW5zZm9ybVByb3AsIDAsIDEsIGNhY2hlLnJlbmRlclRyYW5zZm9ybSwgY2FjaGUsIDAsIC0xKTtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtUHJvcFR3ZWVuLmRlcCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwID09PSBcInNjYWxlXCIpIHtcbiAgICAgICAgICAgICAgdGhpcy5fcHQgPSBuZXcgUHJvcFR3ZWVuKHRoaXMuX3B0LCBjYWNoZSwgXCJzY2FsZVlcIiwgY2FjaGUuc2NhbGVZLCAocmVsYXRpdmUgPyByZWxhdGl2ZSAqIGVuZE51bSA6IGVuZE51bSAtIGNhY2hlLnNjYWxlWSkgfHwgMCk7XG4gICAgICAgICAgICAgIHByb3BzLnB1c2goXCJzY2FsZVlcIiwgcCk7XG4gICAgICAgICAgICAgIHAgKz0gXCJYXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAgPT09IFwidHJhbnNmb3JtT3JpZ2luXCIpIHtcbiAgICAgICAgICAgICAgZW5kVmFsdWUgPSBfY29udmVydEtleXdvcmRzVG9QZXJjZW50YWdlcyhlbmRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgaWYgKGNhY2hlLnN2Zykge1xuICAgICAgICAgICAgICAgIF9hcHBseVNWR09yaWdpbih0YXJnZXQsIGVuZFZhbHVlLCAwLCBzbW9vdGgsIDAsIHRoaXMpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZFVuaXQgPSBwYXJzZUZsb2F0KGVuZFZhbHVlLnNwbGl0KFwiIFwiKVsyXSkgfHwgMDtcbiAgICAgICAgICAgICAgICBlbmRVbml0ICE9PSBjYWNoZS56T3JpZ2luICYmIF9hZGROb25Ud2VlbmluZ1BUKHRoaXMsIGNhY2hlLCBcInpPcmlnaW5cIiwgY2FjaGUuek9yaWdpbiwgZW5kVW5pdCk7XG5cbiAgICAgICAgICAgICAgICBfYWRkTm9uVHdlZW5pbmdQVCh0aGlzLCBzdHlsZSwgcCwgX2ZpcnN0VHdvT25seShzdGFydFZhbHVlKSwgX2ZpcnN0VHdvT25seShlbmRWYWx1ZSkpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAgPT09IFwic3ZnT3JpZ2luXCIpIHtcbiAgICAgICAgICAgICAgX2FwcGx5U1ZHT3JpZ2luKHRhcmdldCwgZW5kVmFsdWUsIDEsIHNtb290aCwgMCwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAgaW4gX3JvdGF0aW9uYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgIF9hZGRSb3RhdGlvbmFsUHJvcFR3ZWVuKHRoaXMsIGNhY2hlLCBwLCBzdGFydE51bSwgZW5kVmFsdWUsIHJlbGF0aXZlKTtcblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCA9PT0gXCJzbW9vdGhPcmlnaW5cIikge1xuICAgICAgICAgICAgICBfYWRkTm9uVHdlZW5pbmdQVCh0aGlzLCBjYWNoZSwgXCJzbW9vdGhcIiwgY2FjaGUuc21vb3RoLCBlbmRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAgPT09IFwiZm9yY2UzRFwiKSB7XG4gICAgICAgICAgICAgIGNhY2hlW3BdID0gZW5kVmFsdWU7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwID09PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgIF9hZGRSYXdUcmFuc2Zvcm1QVHModGhpcywgZW5kVmFsdWUsIHRhcmdldCk7XG5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghKHAgaW4gc3R5bGUpKSB7XG4gICAgICAgICAgICBwID0gX2NoZWNrUHJvcFByZWZpeChwKSB8fCBwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpc1RyYW5zZm9ybVJlbGF0ZWQgfHwgKGVuZE51bSB8fCBlbmROdW0gPT09IDApICYmIChzdGFydE51bSB8fCBzdGFydE51bSA9PT0gMCkgJiYgIV9jb21wbGV4RXhwLnRlc3QoZW5kVmFsdWUpICYmIHAgaW4gc3R5bGUpIHtcbiAgICAgICAgICAgIHN0YXJ0VW5pdCA9IChzdGFydFZhbHVlICsgXCJcIikuc3Vic3RyKChzdGFydE51bSArIFwiXCIpLmxlbmd0aCk7XG4gICAgICAgICAgICBlbmROdW0gfHwgKGVuZE51bSA9IDApO1xuICAgICAgICAgICAgZW5kVW5pdCA9IGdldFVuaXQoZW5kVmFsdWUpIHx8IChwIGluIF9jb25maWcudW5pdHMgPyBfY29uZmlnLnVuaXRzW3BdIDogc3RhcnRVbml0KTtcbiAgICAgICAgICAgIHN0YXJ0VW5pdCAhPT0gZW5kVW5pdCAmJiAoc3RhcnROdW0gPSBfY29udmVydFRvVW5pdCh0YXJnZXQsIHAsIHN0YXJ0VmFsdWUsIGVuZFVuaXQpKTtcbiAgICAgICAgICAgIHRoaXMuX3B0ID0gbmV3IFByb3BUd2Vlbih0aGlzLl9wdCwgaXNUcmFuc2Zvcm1SZWxhdGVkID8gY2FjaGUgOiBzdHlsZSwgcCwgc3RhcnROdW0sIHJlbGF0aXZlID8gcmVsYXRpdmUgKiBlbmROdW0gOiBlbmROdW0gLSBzdGFydE51bSwgIWlzVHJhbnNmb3JtUmVsYXRlZCAmJiAoZW5kVW5pdCA9PT0gXCJweFwiIHx8IHAgPT09IFwiekluZGV4XCIpICYmIHZhcnMuYXV0b1JvdW5kICE9PSBmYWxzZSA/IF9yZW5kZXJSb3VuZGVkQ1NTUHJvcCA6IF9yZW5kZXJDU1NQcm9wKTtcbiAgICAgICAgICAgIHRoaXMuX3B0LnUgPSBlbmRVbml0IHx8IDA7XG5cbiAgICAgICAgICAgIGlmIChzdGFydFVuaXQgIT09IGVuZFVuaXQgJiYgZW5kVW5pdCAhPT0gXCIlXCIpIHtcbiAgICAgICAgICAgICAgdGhpcy5fcHQuYiA9IHN0YXJ0VmFsdWU7XG4gICAgICAgICAgICAgIHRoaXMuX3B0LnIgPSBfcmVuZGVyQ1NTUHJvcFdpdGhCZWdpbm5pbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghKHAgaW4gc3R5bGUpKSB7XG4gICAgICAgICAgICBpZiAocCBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZGQodGFyZ2V0LCBwLCBzdGFydFZhbHVlIHx8IHRhcmdldFtwXSwgZW5kVmFsdWUsIGluZGV4LCB0YXJnZXRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF9taXNzaW5nUGx1Z2luKHAsIGVuZFZhbHVlKTtcblxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3R3ZWVuQ29tcGxleENTU1N0cmluZy5jYWxsKHRoaXMsIHRhcmdldCwgcCwgc3RhcnRWYWx1ZSwgZW5kVmFsdWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByb3BzLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaGFzUHJpb3JpdHkgJiYgX3NvcnRQcm9wVHdlZW5zQnlQcmlvcml0eSh0aGlzKTtcbiAgICB9LFxuICAgIGdldDogX2dldCxcbiAgICBhbGlhc2VzOiBfcHJvcGVydHlBbGlhc2VzLFxuICAgIGdldFNldHRlcjogZnVuY3Rpb24gZ2V0U2V0dGVyKHRhcmdldCwgcHJvcGVydHksIHBsdWdpbikge1xuICAgICAgdmFyIHAgPSBfcHJvcGVydHlBbGlhc2VzW3Byb3BlcnR5XTtcbiAgICAgIHAgJiYgcC5pbmRleE9mKFwiLFwiKSA8IDAgJiYgKHByb3BlcnR5ID0gcCk7XG4gICAgICByZXR1cm4gcHJvcGVydHkgaW4gX3RyYW5zZm9ybVByb3BzICYmIHByb3BlcnR5ICE9PSBfdHJhbnNmb3JtT3JpZ2luUHJvcCAmJiAodGFyZ2V0Ll9nc2FwLnggfHwgX2dldCh0YXJnZXQsIFwieFwiKSkgPyBwbHVnaW4gJiYgX3JlY2VudFNldHRlclBsdWdpbiA9PT0gcGx1Z2luID8gcHJvcGVydHkgPT09IFwic2NhbGVcIiA/IF9zZXR0ZXJTY2FsZSA6IF9zZXR0ZXJUcmFuc2Zvcm0gOiAoX3JlY2VudFNldHRlclBsdWdpbiA9IHBsdWdpbiB8fCB7fSkgJiYgKHByb3BlcnR5ID09PSBcInNjYWxlXCIgPyBfc2V0dGVyU2NhbGVXaXRoUmVuZGVyIDogX3NldHRlclRyYW5zZm9ybVdpdGhSZW5kZXIpIDogdGFyZ2V0LnN0eWxlICYmICFfaXNVbmRlZmluZWQodGFyZ2V0LnN0eWxlW3Byb3BlcnR5XSkgPyBfc2V0dGVyQ1NTU3R5bGUgOiB+cHJvcGVydHkuaW5kZXhPZihcIi1cIikgPyBfc2V0dGVyQ1NTUHJvcCA6IF9nZXRTZXR0ZXIodGFyZ2V0LCBwcm9wZXJ0eSk7XG4gICAgfSxcbiAgICBjb3JlOiB7XG4gICAgICBfcmVtb3ZlUHJvcGVydHk6IF9yZW1vdmVQcm9wZXJ0eSxcbiAgICAgIF9nZXRNYXRyaXg6IF9nZXRNYXRyaXhcbiAgICB9XG4gIH07XG4gIGdzYXAudXRpbHMuY2hlY2tQcmVmaXggPSBfY2hlY2tQcm9wUHJlZml4O1xuXG4gIChmdW5jdGlvbiAocG9zaXRpb25BbmRTY2FsZSwgcm90YXRpb24sIG90aGVycywgYWxpYXNlcykge1xuICAgIHZhciBhbGwgPSBfZm9yRWFjaE5hbWUocG9zaXRpb25BbmRTY2FsZSArIFwiLFwiICsgcm90YXRpb24gKyBcIixcIiArIG90aGVycywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIF90cmFuc2Zvcm1Qcm9wc1tuYW1lXSA9IDE7XG4gICAgfSk7XG5cbiAgICBfZm9yRWFjaE5hbWUocm90YXRpb24sIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBfY29uZmlnLnVuaXRzW25hbWVdID0gXCJkZWdcIjtcbiAgICAgIF9yb3RhdGlvbmFsUHJvcGVydGllc1tuYW1lXSA9IDE7XG4gICAgfSk7XG5cbiAgICBfcHJvcGVydHlBbGlhc2VzW2FsbFsxM11dID0gcG9zaXRpb25BbmRTY2FsZSArIFwiLFwiICsgcm90YXRpb247XG5cbiAgICBfZm9yRWFjaE5hbWUoYWxpYXNlcywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBzcGxpdCA9IG5hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgX3Byb3BlcnR5QWxpYXNlc1tzcGxpdFsxXV0gPSBhbGxbc3BsaXRbMF1dO1xuICAgIH0pO1xuICB9KShcIngseSx6LHNjYWxlLHNjYWxlWCxzY2FsZVkseFBlcmNlbnQseVBlcmNlbnRcIiwgXCJyb3RhdGlvbixyb3RhdGlvblgscm90YXRpb25ZLHNrZXdYLHNrZXdZXCIsIFwidHJhbnNmb3JtLHRyYW5zZm9ybU9yaWdpbixzdmdPcmlnaW4sZm9yY2UzRCxzbW9vdGhPcmlnaW4sdHJhbnNmb3JtUGVyc3BlY3RpdmVcIiwgXCIwOnRyYW5zbGF0ZVgsMTp0cmFuc2xhdGVZLDI6dHJhbnNsYXRlWiw4OnJvdGF0ZSw4OnJvdGF0aW9uWiw4OnJvdGF0ZVosOTpyb3RhdGVYLDEwOnJvdGF0ZVlcIik7XG5cbiAgX2ZvckVhY2hOYW1lKFwieCx5LHosdG9wLHJpZ2h0LGJvdHRvbSxsZWZ0LHdpZHRoLGhlaWdodCxmb250U2l6ZSxwYWRkaW5nLG1hcmdpbixwZXJzcGVjdGl2ZVwiLCBmdW5jdGlvbiAobmFtZSkge1xuICAgIF9jb25maWcudW5pdHNbbmFtZV0gPSBcInB4XCI7XG4gIH0pO1xuXG4gIGdzYXAucmVnaXN0ZXJQbHVnaW4oQ1NTUGx1Z2luKTtcblxuICB2YXIgZ3NhcFdpdGhDU1MgPSBnc2FwLnJlZ2lzdGVyUGx1Z2luKENTU1BsdWdpbikgfHwgZ3NhcCxcbiAgICAgIFR3ZWVuTWF4V2l0aENTUyA9IGdzYXBXaXRoQ1NTLmNvcmUuVHdlZW47XG5cbiAgZXhwb3J0cy5CYWNrID0gQmFjaztcbiAgZXhwb3J0cy5Cb3VuY2UgPSBCb3VuY2U7XG4gIGV4cG9ydHMuQ1NTUGx1Z2luID0gQ1NTUGx1Z2luO1xuICBleHBvcnRzLkNpcmMgPSBDaXJjO1xuICBleHBvcnRzLkN1YmljID0gQ3ViaWM7XG4gIGV4cG9ydHMuRWxhc3RpYyA9IEVsYXN0aWM7XG4gIGV4cG9ydHMuRXhwbyA9IEV4cG87XG4gIGV4cG9ydHMuTGluZWFyID0gTGluZWFyO1xuICBleHBvcnRzLlBvd2VyMCA9IFBvd2VyMDtcbiAgZXhwb3J0cy5Qb3dlcjEgPSBQb3dlcjE7XG4gIGV4cG9ydHMuUG93ZXIyID0gUG93ZXIyO1xuICBleHBvcnRzLlBvd2VyMyA9IFBvd2VyMztcbiAgZXhwb3J0cy5Qb3dlcjQgPSBQb3dlcjQ7XG4gIGV4cG9ydHMuUXVhZCA9IFF1YWQ7XG4gIGV4cG9ydHMuUXVhcnQgPSBRdWFydDtcbiAgZXhwb3J0cy5RdWludCA9IFF1aW50O1xuICBleHBvcnRzLlNpbmUgPSBTaW5lO1xuICBleHBvcnRzLlN0ZXBwZWRFYXNlID0gU3RlcHBlZEVhc2U7XG4gIGV4cG9ydHMuU3Ryb25nID0gU3Ryb25nO1xuICBleHBvcnRzLlRpbWVsaW5lTGl0ZSA9IFRpbWVsaW5lO1xuICBleHBvcnRzLlRpbWVsaW5lTWF4ID0gVGltZWxpbmU7XG4gIGV4cG9ydHMuVHdlZW5MaXRlID0gVHdlZW47XG4gIGV4cG9ydHMuVHdlZW5NYXggPSBUd2Vlbk1heFdpdGhDU1M7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IGdzYXBXaXRoQ1NTO1xuICBleHBvcnRzLmdzYXAgPSBnc2FwV2l0aENTUztcblxuICBpZiAodHlwZW9mKHdpbmRvdykgPT09ICd1bmRlZmluZWQnIHx8IHdpbmRvdyAhPT0gZXhwb3J0cykge09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7fSBlbHNlIHtkZWxldGUgd2luZG93LmRlZmF1bHQ7fVxuXG59KSkpO1xuIiwiZnVuY3Rpb24gaW5pdEhlYWRlcigpIHtcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaGVhZGVyJyk7XG5cbiAgICBsZXQgcHJldl9zY3JvbGxfcG9zaXRpb24gPSAwO1xuICAgIGxldCBsYXN0X2tub3duX3Njcm9sbF9wb3NpdGlvbiA9IDA7XG4gICAgbGV0IHRpY2tpbmcgPSBmYWxzZTtcbiAgICBjb25zdCBvZmZzZXQgPSA4MDtcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZUhlYWRlcihsYXN0X3Njcm9sbF9wb3MsIHByZXZfc2Nyb2xsX3Bvcykge1xuICAgICAgICBpZiAoIWhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoJ2hlYWRlci0tZnJlZXplZCcpKSB7XG4gICAgICAgICAgICBpZiAobGFzdF9zY3JvbGxfcG9zID4gcHJldl9zY3JvbGxfcG9zKSB7XG4gICAgICAgICAgICAgICAgLy8gc2Nyb2xsZWQgZG93blxuICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzY3JvbGxlZCB1cFxuICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldl9zY3JvbGxfcG9zaXRpb24gPSBsYXN0X2tub3duX3Njcm9sbF9wb3NpdGlvbjtcbiAgICAgICAgICAgIGlmIChsYXN0X2tub3duX3Njcm9sbF9wb3NpdGlvbiA8IG9mZnNldCkge1xuICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoZWFkZXItLXRyYW5zcGFyZW50Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoZWFkZXItLXRyYW5zcGFyZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKGV2KSA9PiB7XG4gICAgICAgIGxhc3Rfa25vd25fc2Nyb2xsX3Bvc2l0aW9uID0gd2luZG93LnNjcm9sbFk7XG5cbiAgICAgICAgaWYgKCF0aWNraW5nKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZUhlYWRlcihsYXN0X2tub3duX3Njcm9sbF9wb3NpdGlvbiwgcHJldl9zY3JvbGxfcG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHRpY2tpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aWNraW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpbml0SGVhZGVyOyIsImZ1bmN0aW9uIGluaXRMYXp5bG9hZCgpIHtcbiAgY29uc3QgaW1nT2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMsIHNlbGYpID0+IHtcbiAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgIGxhenlMb2FkKGVudHJ5LnRhcmdldCk7XG4gICAgICAgIHNlbGYudW5vYnNlcnZlKGVudHJ5LnRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubGF6eS1waWN0dXJlJykuZm9yRWFjaCgocGljdHVyZSkgPT4ge1xuICAgIGltZ09ic2VydmVyLm9ic2VydmUocGljdHVyZSk7XG4gIH0pO1xuXG4gIGNvbnN0IGxhenlMb2FkID0gKHBpY3R1cmUpID0+IHtcbiAgICBjb25zdCBpbWcgPSBwaWN0dXJlLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpIHx8IHBpY3R1cmU7XG4gICAgY29uc3Qgc291cmNlcyA9IHBpY3R1cmUucXVlcnlTZWxlY3RvckFsbCgnc291cmNlJyk7XG4gIFxuICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICBzb3VyY2Uuc3Jjc2V0ID0gc291cmNlLmRhdGFzZXQuc3Jjc2V0O1xuICAgICAgc291cmNlLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1zcmNzZXQnKTtcbiAgICB9KTtcbiAgICBpZiAoaW1nKSB7XG4gICAgICBpbWcuc3JjID0gaW1nLmRhdGFzZXQuc3JjO1xuICAgICAgaW1nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1zcmMnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5pdExhenlsb2FkOyIsImltcG9ydCB7Z3NhcH0gZnJvbSAnZ3NhcCc7XG5pbXBvcnQgeyBTY3JvbGxUcmlnZ2VyIH0gZnJvbSBcImdzYXAvZGlzdC9TY3JvbGxUcmlnZ2VyXCI7XG5cbmdzYXAucmVnaXN0ZXJQbHVnaW4oU2Nyb2xsVHJpZ2dlcik7XG5cbmZ1bmN0aW9uIGluaXRQYXJhbGxheEFuaW1hdGlvbnMoKSB7XG4gICAgY29uc3QgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcGFyYWxsYXg9XCJ0cnVlXCJdJyksXG4gICAgICAgIG11bHRpcGxpZXIgPSAyMCxcbiAgICAgICAgYnJlYWtwb2ludERlc2t0b3AgPSAxNDQwO1xuXG4gICAgZWxzLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBlbFRsID0gZ3NhcC50aW1lbGluZSgpO1xuXG4gICAgICAgIC8vIGNvbnN0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGJvZHkuY2xpZW50V2lkdGg7XG4gICAgICAgIGVsVGwudG8oZWwsIHtcbiAgICAgICAgICAgIHlQZXJjZW50OiBpbmRleCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIG11bHRpcGxpZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgU2Nyb2xsVHJpZ2dlci5jcmVhdGUoe1xuICAgICAgICAgICAgYW5pbWF0aW9uOiBlbFRsLFxuICAgICAgICAgICAgdHJpZ2dlcjogZWwsXG4gICAgICAgICAgICBzdGFydDogJ3RvcCBib3R0b20nLFxuICAgICAgICAgICAgc2NydWI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXRQYXJhbGxheEFuaW1hdGlvbnM7IiwiZnVuY3Rpb24gc2Nyb2xsVG9TZWN0aW9uKCkge1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2Nyb2xsLXRvJyk7XG5cbiAgaWYgKGJ0bikge1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1ocmVmJykpO1xuXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcblxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oe1xuICAgICAgICAgIHRvcDogb2Zmc2V0LFxuICAgICAgICAgIGJlaGF2aW91cjogJ3Ntb290aCdcbiAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNjcm9sbFRvU2VjdGlvbjsiLCJpbXBvcnQgaW5pdExhenlMb2FkIGZyb20gJy4vY29tcG9uZW50cy9sYXp5bG9hZCc7XG5pbXBvcnQgc2Nyb2xsVG9TZWN0aW9uIGZyb20gJy4vY29tcG9uZW50cy9zY3JvbGxUb1NlY3Rpb24nO1xuaW1wb3J0IGluaXRQYXJhbGxheEFuaW1hdGlvbnMgZnJvbSAnLi9jb21wb25lbnRzL3BhcmFsbGF4QW5pbWF0aW9ucyc7XG5pbXBvcnQgaW5pdEhlYWRlciBmcm9tICcuL2NvbXBvbmVudHMvaGVhZGVyJztcbi8vIGltcG9ydCBpbml0U3BsaXR0aW5nIGZyb20gJy4vY29tcG9uZW50cy9zcGxpdHRpbmcnO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAvLyBjb25zb2xlLndhcm4oJ2xvYWRlZCcpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgaW5pdExhenlMb2FkKCk7XG4gICAgc2Nyb2xsVG9TZWN0aW9uKCk7XG4gICAgaW5pdFBhcmFsbGF4QW5pbWF0aW9ucygpO1xuICAgIGluaXRIZWFkZXIoKTtcbiAgICAvLyBpbml0U3BsaXR0aW5nKCk7XG59KTsiXX0=
