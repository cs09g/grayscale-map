class Shader {
  constructor(params) {
    mapboxgl.accessToken = "pk.eyJ1IjoiY3MwOWciLCJhIjoiY2s0N3Uxemp5MGVzcjNrcGE3bG1uaWs1MCJ9.3-rt7AqzSgxkKKOWR3TEFQ";
    this.container = params.container;
    this.coefficients = [0.2126, 0.7152, 0.0722];
    this.weights = [0, 0, 0];
    this.map = this.createMap("map");
    this.setEvent();
  }

  createMap(container) {
    return new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [126.97646293536866, 37.570620463172745],
      zoom: 9,
    });
  }

  setEvent() {
    this.map.once("styledata", () => {
      this.baseStyle = this.map.getStyle();
      this.setGrayScale();
    });

    const redCoefficient = this.container.querySelector("#red-coefficient");
    const greenCoefficient = this.container.querySelector("#green-coefficient");

    redCoefficient.addEventListener("input", (e) => {
      let green = e.target.parentNode.children[2];

      e.target.value = Math.min(e.target.value, green.value - 0.0001);

      var children = e.target.parentNode.firstElementChild.children;
      children[0].style.width = children[2].style.left = children[3].style.left = children[5].style.left =
        e.target.value * 100 + "%";
      children[5].firstElementChild.innerHTML = e.target.value;

      children[2].style.width = (green.value - e.target.value) * 100 + "%";
      children[6].firstElementChild.innerHTML = (green.value - e.target.value).toFixed(4);
    });

    greenCoefficient.addEventListener("input", (e) => {
      let red = e.target.parentNode.children[1];
      let blue = 1 - e.target.value - red.value;

      e.target.value = Math.max(e.target.value, red.value - -0.0001);

      var children = e.target.parentNode.firstElementChild.children;
      children[1].style.width = children[2].style.right = 100 - e.target.value * 100 + "%";
      children[4].style.left = children[6].style.left = e.target.value * 100 + "%";
      children[6].childNodes[1].innerHTML = (e.target.value - red.value).toFixed(4);

      children[2].style.width = (e.target.value - red.value) * 100 + "%";
    });

    redCoefficient.addEventListener("change", (e) => {
      this.coefficients = [+e.target.value, greenCoefficient.value - e.target.value, 1 - greenCoefficient.value].map(
        (val) => +val.toFixed(4),
      );
      this.setGrayScale();
    });

    greenCoefficient.addEventListener("change", (e) => {
      this.coefficients = [+redCoefficient.value, e.target.value - redCoefficient.value, 1 - e.target.value].map(
        (val) => +val.toFixed(4),
      );
      this.setGrayScale();
    });

    this.container.querySelectorAll("[id$=weight").forEach((weight, idx) => {
      weight.addEventListener("change", (e) => {
        this.weights[idx] = (+e.target.value).toFixed(2);
        e.target.parentNode.querySelector(".text").innerHTML = this.weights[idx];
        this.setGrayScale();
      });
    });
  }

  convertToGrayScale(r, g, b) {
    const y = this.coefficients[0] * r + this.coefficients[1] * g + this.coefficients[2] * b;
    return [y + y * this.weights[0], y + y * this.weights[1], y + y * this.weights[2]];
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

  addRGBWeight(r, g, b, weightR = 1, weightG = 1, weightB = 1) {}
}
