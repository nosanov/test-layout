(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.addEventListener('load', function () {// console.warn('loaded');
});
document.addEventListener('DOMContentLoaded', function () {
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
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU0sQ0FDcEM7QUFDRCxDQUZEO0FBSUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFNO0FBQ2xELE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUosQ0FBeUIsVUFBQyxPQUFELEVBQVUsSUFBVixFQUFtQjtBQUM5RCxJQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQUEsS0FBSyxFQUFJO0FBQ3ZCLFVBQUksS0FBSyxDQUFDLGNBQVYsRUFBMEI7QUFDeEIsUUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQVAsQ0FBUjtBQUNBLFFBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFLLENBQUMsTUFBckI7QUFDRDtBQUNGLEtBTEQ7QUFNRCxHQVBtQixDQUFwQjtBQVFBLEVBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLE9BQTNDLENBQW1ELFVBQUMsT0FBRCxFQUFhO0FBQzlELElBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsT0FBcEI7QUFDRCxHQUZEOztBQUlBLE1BQU0sUUFBUSxHQUFHLFNBQVgsUUFBVyxDQUFDLE9BQUQsRUFBYTtBQUM1QixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBUixDQUFzQixLQUF0QixLQUFnQyxPQUE1QztBQUNBLFFBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixRQUF6QixDQUFoQjtBQUVBLElBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBQyxNQUFELEVBQVk7QUFDMUIsTUFBQSxNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUMsT0FBUCxDQUFlLE1BQS9CO0FBQ0EsTUFBQSxNQUFNLENBQUMsZUFBUCxDQUF1QixhQUF2QjtBQUNELEtBSEQ7O0FBSUEsUUFBSSxHQUFKLEVBQVM7QUFDUCxNQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUF0QjtBQUNBLE1BQUEsR0FBRyxDQUFDLGVBQUosQ0FBb0IsVUFBcEI7QUFDRDtBQUNGLEdBWkQ7QUFhRCxDQTFCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAvLyBjb25zb2xlLndhcm4oJ2xvYWRlZCcpO1xufSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGNvbnN0IGltZ09ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzLCBzZWxmKSA9PiB7XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICBsYXp5TG9hZChlbnRyeS50YXJnZXQpO1xuICAgICAgICBzZWxmLnVub2JzZXJ2ZShlbnRyeS50YXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxhenktcGljdHVyZScpLmZvckVhY2goKHBpY3R1cmUpID0+IHtcbiAgICBpbWdPYnNlcnZlci5vYnNlcnZlKHBpY3R1cmUpO1xuICB9KTtcblxuICBjb25zdCBsYXp5TG9hZCA9IChwaWN0dXJlKSA9PiB7XG4gICAgY29uc3QgaW1nID0gcGljdHVyZS5xdWVyeVNlbGVjdG9yKCdpbWcnKSB8fCBwaWN0dXJlO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBwaWN0dXJlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NvdXJjZScpO1xuICBcbiAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgc291cmNlLnNyY3NldCA9IHNvdXJjZS5kYXRhc2V0LnNyY3NldDtcbiAgICAgIHNvdXJjZS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc3Jjc2V0Jyk7XG4gICAgfSk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLnNyYyA9IGltZy5kYXRhc2V0LnNyYztcbiAgICAgIGltZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc3JjJyk7XG4gICAgfVxuICB9XG59KTsiXX0=
