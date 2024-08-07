'use strict';

// testing-git
// prettier-ignore

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10, -1);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lgt]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;

    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();
  }

  // r = d/Δt
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Erro ao obter a localização atual, tente novamente.');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude);
    console.log(longitude);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 17);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault();

    // Validando as entradas do usuário, previnindo strigs;
    const validInputs = (...inputs) =>
      inputs.every(currentElement => Number.isFinite(currentElement));
    const allPositive = (...inputs) =>
      inputs.every(currentElement => currentElement > 0);

    // Obter os dados do formulário
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);

    // Verificar se os dados são válido

    // Se o treino for correr, crie um objeto correr
    if (type === 'running') {
      const cadence = +inputCadence.value; // + = transformar em number

      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        // Excluindo os números negativos;
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert(`As entradas devem ser números positivos!`);
      }
    }

    // Se o treino for pedalar, crie um objeto pedalar
    if (type === 'cycling') {
      const elevation = +inputElevation.value; // + = transformar em number

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert(`As entradas devem ser números positivos!`);
    }

    // Adicionar o novo objeto na array de treinos
    // Rederizar no mapa como um marcador
    //display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng], {})
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          closeOnEscapeKey: false,
          className: 'running-popup',
          content: 'Corrida realizada em 20 de Julho',
        })
      )
      .setPopupContent(`Corrida realizada em ${this.date}`)
      .openPopup();

    // Renderizar o novo treino na lista

    // Hide for and clear input filds
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';
  }
}

const app = new App();
