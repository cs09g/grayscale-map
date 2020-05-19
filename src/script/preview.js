class Shader {
  constructor(params) {
    mapboxgl.accessToken = "pk.eyJ1IjoiY3MwOWciLCJhIjoiY2s0N3Uxemp5MGVzcjNrcGE3bG1uaWs1MCJ9.3-rt7AqzSgxkKKOWR3TEFQ";
    this.container = params.container;
    this.grayscale = {
      coefficients: [0.2126, 0.7152, 0.0722],
      weights: [0, 0, 0],
    };
    this.hsl = {
      hue: 0,
      saturation: 0,
      lightness: 0,
    };
    this.map = this.createMap("map");
    this.setEvents();
  }

  createMap(container) {
    return new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [126.97646293536866, 37.570620463172745],
      zoom: 9,
    });
  }

  setEvents() {
    this.map.once("styledata", () => {
      this.baseStyle = this.map.getStyle();
    });

    this.setGrayscaleEvents(this.container.querySelector("#grayscale-container"));
    this.setHSLEvents(this.container.querySelector("#hsl-container"));
  }

  setGrayscaleEvents(container) {
    const grayscaleCheck = container.querySelector("#apply-grayscale");
    grayscaleCheck.addEventListener("click", (e) => {
      if (e.target.checked) {
        this.displayGrayscaleOptions();
        this.setGrayScale();
      } else {
        this.hideGrayscaleOptions();
        this.map.setStyle(this.baseStyle);
      }
    });

    const redCoefficient = container.querySelector("#red-coefficient");
    const greenCoefficient = container.querySelector("#green-coefficient");

    redCoefficient.addEventListener("input", (e) => {
      let green = e.target.parentNode.children[2];

      e.target.value = Math.min(e.target.value, green.value - 0.0001);

      var children = e.target.parentNode.firstElementChild.children;
      children[0].style.width = children[2].style.left = children[3].style.left = children[5].style.left =
        e.target.value * 100 + "%";
      children[2].style.width = (green.value - e.target.value) * 100 + "%";
      children[5].firstElementChild.innerHTML = e.target.value;
      children[6].firstElementChild.innerHTML = (green.value - e.target.value).toFixed(4);
    });

    greenCoefficient.addEventListener("input", (e) => {
      let red = e.target.parentNode.children[1];
      let blue = 1 - e.target.value - red.value;

      e.target.value = Math.max(e.target.value, red.value - -0.0001);

      var children = e.target.parentNode.firstElementChild.children;
      children[1].style.width = children[2].style.right = 100 - e.target.value * 100 + "%";
      children[2].style.width = (e.target.value - red.value) * 100 + "%";
      children[4].style.left = children[6].style.left = e.target.value * 100 + "%";
      children[6].childNodes[1].innerHTML = (e.target.value - red.value).toFixed(4);
    });

    redCoefficient.addEventListener("change", (e) => {
      this.grayscale.coefficients = [+e.target.value, greenCoefficient.value - e.target.value, 1 - greenCoefficient.value].map(
        (val) => +val.toFixed(4),
      );
      this.setGrayScale();
    });

    greenCoefficient.addEventListener("change", (e) => {
      this.grayscale.coefficients = [+redCoefficient.value, e.target.value - redCoefficient.value, 1 - e.target.value].map(
        (val) => +val.toFixed(4),
      );
      this.setGrayScale();
    });

    container.querySelectorAll("[id$=weight").forEach((weight, idx) => {
      weight.addEventListener("change", (e) => {
        this.grayscale.weights[idx] = (+e.target.value).toFixed(2);
        e.target.parentNode.querySelector(".text").innerHTML = this.grayscale.weights[idx];
        this.setGrayScale();
      });
    });
  }

  displayGrayscaleOptions() {
    this.container.querySelectorAll("#grayscale-container .sub-menu").forEach((sub) => {
      sub.classList.remove("hidden");
    });
  }

  hideGrayscaleOptions() {
    this.container.querySelectorAll("#grayscale-container .sub-menu").forEach((sub) => {
      sub.classList.add("hidden");
    });
  }

  convertToGrayScale(r, g, b) {
    const coefficients = this.grayscale.coefficients;
    const weights = this.grayscale.weights;
    const y = coefficients[0] * r + coefficients[1] * g + coefficients[2] * b;
    return [y + y * weights[0], y + y * weights[1], y + y * weights[2]];
  }

  setGrayScale() {
    this.map.setStyle(
      JSON.parse(
        // @TODO: handling hex color
        JSON.stringify(this.baseStyle).replace(/(rgba|hsl)[\%\s(),\d+\.]+/g, (token) => {
          const split = token.match(/[\d\.]+/g);
          const rgb = token.startsWith("hsl") ? this.hslToRgb(...split.map((each) => each / 100)) : split;
          const grayscale = this.convertToGrayScale(...rgb).map((each) => each.toFixed(2));
          return `rgba(${grayscale.join(",")},${isNaN(split[3]) ? 1 : split[3]})`;
        }),
      ),
    );
  }

  setHSLEvents(container) {
    container.querySelector("#apply-hsl").addEventListener("click", (e) => {
      if (e.target.checked) {
        this.displayHSLOptions();
        this.setHSL();
      } else {
        this.hideHSLOptions();
        this.map.setStyle(this.baseStyle);
      }
    });

    container.querySelector("#hue-scale").addEventListener("input", (e) => {
      this.hsl.hue = +e.target.value;
      e.target.nextElementSibling.innerText = e.target.value;
      this.setHSL();
    });

    container.querySelector("#saturation-scale").addEventListener("input", (e) => {
      this.hsl.saturation = +e.target.value;
      e.target.nextElementSibling.innerText = e.target.value;
      this.setHSL();
    });

    container.querySelector("#lightness-scale").addEventListener("input", (e) => {
      this.hsl.lightness = +e.target.value;
      e.target.nextElementSibling.innerText = e.target.value;
      this.setHSL();
    });
  }

  displayHSLOptions() {
    this.container.querySelectorAll("#hsl-container .sub-menu").forEach((sub) => {
      sub.classList.remove("hidden");
    });
  }

  hideHSLOptions() {
    this.container.querySelectorAll("#hsl-container .sub-menu").forEach((sub) => {
      sub.classList.add("hidden");
    });
  }

  setHSL() {
    this.map.setStyle(
      JSON.parse(
        JSON.stringify(this.baseStyle).replace(/(rgba|hsl)[\%\s(),\d+\.]+/g, (token) => {
          const split = token.match(/[\d\.]+/g);
          const hsl = token.startsWith("rgb") ? this.rgbToHsl(...split.map((each) => each / 100)) : split;
          hsl[0] = (+hsl[0] + this.hsl.hue) % 360;
          hsl[1] = this.clamp(+hsl[1] + this.hsl.saturation, 0, 100) + "%";
          hsl[2] = this.clamp(+hsl[2] + this.hsl.lightness, 0, 100) + "%";
          return `hsla(${hsl.join(",")},${isNaN(split[3]) ? 1 : split[3]})`;
        }),
      ),
    );
  }

  clamp(value, min, max) {
    if (value <= min) value = min;
    else if (value >= max) value = max;
    return value;
  }
  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param {number} h The hue
   * @param {number} s The saturation
   * @param {number} l The lightness
   * @return {Array} The RGB representation
   */
  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  rgbToHsl(r, g, b) {
    const [cmax, cmin] = [Math.max(r, g, b), Math.min(r, g, b)];
    const diff = cmax - cmin;
    let hue, saturation, lightness;
    lightness = (cmax + cmin) / 2;
    saturation = diff / (1 - Math.abs(2 * lightness - 1));

    if (diff === 0) {
      hue = 0;
    } else if (cmax === r) {
      hue = 60 * ((g - b) / diff % 6)
    } else if (cmax === g) {
      hue = 60 * ((b - r) / diff + 2);
    } else if (cmax === b) {
      hue = 60 * ((r - g) / diff + 4);
    }

    return [hue, saturation * 100, lightness * 100];
  }
}
