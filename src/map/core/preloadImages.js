import { loadImage, prepareIcon } from './mapUtil';

import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/bc2.png';

import animalOnline from '../../resources/images/icon/devices/marker_animal_online.png';
import animalOffline from '../../resources/images/icon/devices/marker_animal_offline.png';
import animalMovement from '../../resources/images/icon/devices/marker_animal_movement.png';
// import animalOffline from '../../resources/images/icon/devices/marker_offline.png';

import bicycleOnline from '../../resources/images/icon/devices/marker_bicycle_online.png';
import bicycleOffline from '../../resources/images/icon/devices/marker_bicycle_offline.png';
import bicycleMovement from '../../resources/images/icon/devices/marker_bicycle_movement.png';
// import bicycleOffline from '../../resources/images/icon/devices/marker_bicycle_offline.png';

import boatOnline from '../../resources/images/icon/devices/marker_boat_online.png';
import boatOffline from '../../resources/images/icon/devices/marker_boat_offline.png';
import boatMovement from '../../resources/images/icon/devices/marker_bicycle_movement.png';
// import boatOnline from '../../resources/images/icon/devices/marker_bicycle_offline.png';

import busOnline from '../../resources/images/icon/devices/marker_bus_online.png';
import busOffline from '../../resources/images/icon/devices/marker_bus_offline.png';
import busMovement from '../../resources/images/icon/devices/marker_bus_movement.png';
// import busStop from '../../resources/images/icon/devices/marker_bus_offline.png';

import craneOnline from '../../resources/images/icon/devices/marker_crane_online.png';
import craneOffline from '../../resources/images/icon/devices/marker_crane_offline.png';
import craneMovement from '../../resources/images/icon/devices/marker_crane_movement.png';
// import craneStop from '../../resources/images/icon/devices/marker_crane_offline.png';

import carOnline from '../../resources/images/icon/devices/marker_car_online.png';
import carOffline from '../../resources/images/icon/devices/marker_car_offline.png';
import carMovement from '../../resources/images/icon/devices/marker_car_movement.png';
// import carStop from '../../resources/images/icon/devices/marker_car_offline.png';

import defaultOnline from '../../resources/images/icon/devices/marker_arrow_online.png';
import defaultOffline from '../../resources/images/icon/devices/marker_arrow_offline.png';
import defaultMovement from '../../resources/images/icon/devices/marker_arrow_movement.png';
// import defaultStop from '../../resources/images/icon/devices/marker_arrow_offline.png';

import helicopterOnline from '../../resources/images/icon/devices/marker_helicopter_online.png';
import helicopterOffline from '../../resources/images/icon/devices/marker_helicopter_offline.png';
import helicopterMovement from '../../resources/images/icon/devices/marker_helicopter_movement.png';
// import helicopterStop from '../../resources/images/icon/devices/marker_helicopter_offline.png';

import motorcycleOnline from '../../resources/images/icon/devices/marker_motorcycle_online.png';
import motorcycleOffline from '../../resources/images/icon/devices/marker_motorcycle_offline.png';
import motorcycleMovement from '../../resources/images/icon/devices/marker_motorcycle_movement.png';
// import motorcycleStop from '../../resources/images/icon/devices/marker_motorcycle_offline.png';

import offroadOnline from '../../resources/images/icon/devices/marker_offroad_online.png';
import offroadOffline from '../../resources/images/icon/devices/marker_offroad_offline.png';
import offroadMovement from '../../resources/images/icon/devices/marker_offroad_movement.png';
// import offroadStop from '../../resources/images/icon/devices/marker_offroad_offline.png';

import personOnline from '../../resources/images/icon/devices/marker_person_online.png';
import personOffline from '../../resources/images/icon/devices/marker_person_offline.png';
import personMovement from '../../resources/images/icon/devices/marker_person_movement.png';
// import personStop from '../../resources/images/icon/devices/marker_person_offline.png';

import pickupOnline from '../../resources/images/icon/devices/marker_pickup_online.png';
import pickupOffline from '../../resources/images/icon/devices/marker_pickup_offline.png';
import pickupMovement from '../../resources/images/icon/devices/marker_pickup_movement.png';
// import pickupStop from '../../resources/images/icon/devices/marker_pickup_offline.png';

import planeOnline from '../../resources/images/icon/devices/marker_plane_online.png';
import planeOffline from '../../resources/images/icon/devices/marker_plane_offline.png';
import planeMovement from '../../resources/images/icon/devices/marker_plane_movement.png';
// import planeStop from '../../resources/images/icon/devices/marker_plane_offline.png';

import scooterOnline from '../../resources/images/icon/devices/marker_bicycle_online.png';
import scooterOffline from '../../resources/images/icon/devices/marker_bicycle_offline.png';
import scooterMovement from '../../resources/images/icon/devices/marker_bicycle_offline.png';
// import scooterStop from '../../resources/images/icon/devices/marker_scooter_offline.png';

import shipOnline from '../../resources/images/icon/devices/marker_ship_online.png';
import shipOffline from '../../resources/images/icon/devices/marker_ship_offline.png';
import shipMovement from '../../resources/images/icon/devices/marker_ship_movement.png';
// import shipStop from '../../resources/images/icon/devices/marker_ship_offline.png';

import tractorOnline from '../../resources/images/icon/devices/marker_tractor_online.png';
import tractorOffline from '../../resources/images/icon/devices/marker_tractor_offline.png';
import tractorMovement from '../../resources/images/icon/devices/marker_tractor_movement.png';
// import tractorStop from '../../resources/images/icon/devices/marker_tractor_offline.png';

import truckOnline from '../../resources/images/icon/devices/marker_truck_online.png';
import truckOffline from '../../resources/images/icon/devices/marker_truck_offline.png';
import truckMovement from '../../resources/images/icon/devices/marker_truck_movement.png';
// import truckStop from '../../resources/images/icon/devices/marker_truck_offline.png';

import vanOnline from '../../resources/images/icon/devices/marker_van_online.png';
import vanOffline from '../../resources/images/icon/devices/marker_van_offline.png';
import vanMovement from '../../resources/images/icon/devices/marker_van_movement.png';
// import vanStop from '../../resources/images/icon/devices/marker_van_offline.png';

import smartphoneOnline from '../../resources/images/icon/devices/marker_mobile_online.png';
import smartphoneOffline from '../../resources/images/icon/devices/marker_mobile_offline.png';
import smartphoneMovement from '../../resources/images/icon/devices/marker_mobile_movement.png';
// import smartphoneMovement from '../../resources/images/icon/devices/marker_smartphone_offline.png';
// import smartphoneStop from '../../resources/images/icon/devices/marker_smartphone_offline.png';



import animalPng from '../../resources/images/icon/animal.png';
import bicyclePng from '../../resources/images/icon/bicycle.png';
import boatPng from '../../resources/images/icon/boat.png';
import busPng from '../../resources/images/icon/bus.png';
import cranePng from '../../resources/images/icon/crane.png';
import carPng from '../../resources/images/icon/car.png';
import defaultPng from '../../resources/images/icon/default.png';
import helicopterPng from '../../resources/images/icon/helicopter.png';
import motorcyclePng from '../../resources/images/icon/motorcycle.png';
import offroadPng from '../../resources/images/icon/offroad.png';
import personPng from '../../resources/images/icon/person.png';
import pickupPng from '../../resources/images/icon/pickup.png';
import planePng from '../../resources/images/icon/plane.png';
import scooterPng from '../../resources/images/icon/scooter.png';
import shipPng from '../../resources/images/icon/ship.png';
import tractorPng from '../../resources/images/icon/tractor.png';
import truckPng from '../../resources/images/icon/truck.png';
import vanPng from '../../resources/images/icon/van.png';
import smartphonePng from '../../resources/images/icon/smartphone.png';

export const mapIcons = {
  // animal: animalPng,
  // bicycle: bicyclePng,
  // boat: boatPng,
  // bus: busPng,
  // car: carPng,
  // crane: cranePng,
  // default: defaultPng,
  // helicopter: helicopterPng,
  // motorcycle: motorcyclePng,
  // offroad: offroadPng,
  // person: personPng,
  // pickup: pickupPng,
  // plane: planePng,
  // scooter: scooterPng,
  // ship: shipPng,
  // tractor: tractorPng,
  // truck: truckPng,
  // van: vanPng,
  // smartphone: smartphonePng,
  animal: { success: animalOnline, error: animalOffline, info: animalMovement, neutral: animalOnline },
  bicycle: { success: bicycleOnline, error: bicycleOffline, info: bicycleMovement, neutral: bicycleOnline },
  boat: { success: boatOnline, error: boatOffline, info: boatMovement, neutral: boatOffline },
  bus: { success: busOnline, error: busOffline, info: busMovement, neutral: busOffline },
  car: { success: carOnline, error: carOffline, info: carMovement, neutral: carOffline },
  crane: { success: craneOnline, error: craneOffline, info: craneMovement, neutral: craneOffline },
  default: { success: defaultOnline, error: defaultOffline, info: defaultMovement, neutral: defaultOffline },
  helicopter: { success: helicopterOnline, error: helicopterOffline, info: helicopterMovement, neutral: helicopterOffline },
  motorcycle: { success: motorcycleOnline, error: motorcycleOffline, info: motorcycleMovement, neutral: motorcycleOffline },
  offroad: { success: offroadOnline, error: offroadOffline, info: offroadMovement, neutral: offroadOffline },
  person: { success: personOnline, error: personOffline, info: personMovement, neutral: personOffline },
  pickup: { success: pickupOnline, error: pickupOffline, info: pickupMovement, neutral: pickupOffline },
  plane: { success: planeOnline, error: planeOffline, info: planeMovement, neutral: planeOffline },
  scooter: { success: scooterOnline, error: scooterOffline, info: scooterMovement, neutral: scooterOffline },
  ship: { success: shipOnline, error: shipOffline, info: shipMovement, neutral: shipOffline },
  tractor: { success: tractorOnline, error: tractorOffline, info: tractorMovement, neutral: tractorOffline },
  truck: { success: truckOnline, error: truckOffline, info: truckMovement, neutral: truckOffline },
  van: { success: vanOnline, error: vanOffline, info: vanMovement, neutral: vanOffline },
  smartphone: { success: smartphoneOnline, error: smartphoneOffline, info: smartphoneMovement, neutral: smartphoneOnline },
  // car: { success: carOnline, error: boatOffline, info: boatPng, neutral: boatPng },
  // truck: { success: truckPng, error: personPng, info: boatPng, neutral: boatPng },
  // motorcycle: { success: motorcyclePng, error: boatOffline, info: boatPng, neutral: boatPng },


};

export const mapOriginalIcons = {
  animal: animalPng,
  bicycle: bicyclePng,
  boat: boatPng,
  bus: busPng,
  car: carPng,
  crane: cranePng,
  default: defaultPng,
  helicopter: helicopterPng,
  motorcycle: motorcyclePng,
  offroad: offroadPng,
  person: personPng,
  pickup: pickupPng,
  plane: planePng,
  scooter: scooterPng,
  ship: shipPng,
  tractor: tractorPng,
  truck: truckPng,
  van: vanPng,
  smartphone: smartphonePng,
  // animal: { success: animalOnline, error: animalOffline, info: animalMovement, neutral: animalOnline },
  // bicycle: { success: bicycleOnline, error: bicycleOffline, info: bicycleMovement, neutral: bicycleOnline },
  // boat: { success: boatOnline, error: boatOffline, info: boatMovement, neutral: boatOffline },
  // bus: { success: busOnline, error: busOffline, info: busMovement, neutral: busOffline },
  // car: { success: carOnline, error: carOffline, info: carMovement, neutral: carOffline },
  // crane: { success: craneOnline, error: craneOffline, info: craneMovement, neutral: craneOffline },
  // default: { success: defaultOnline, error: defaultOffline, info: defaultMovement, neutral: defaultOffline },
  // helicopter: { success: helicopterOnline, error: helicopterOffline, info: helicopterMovement, neutral: helicopterOffline },
  // motorcycle: { success: motorcycleOnline, error: motorcycleOffline, info: motorcycleMovement, neutral: motorcycleOffline },
  // offroad: { success: offroadOnline, error: offroadOffline, info: offroadMovement, neutral: offroadOffline },
  // person: { success: personOnline, error: personOffline, info: personMovement, neutral: personOffline },
  // pickup: { success: pickupOnline, error: pickupOffline, info: pickupMovement, neutral: pickupOffline },
  // plane: { success: planeOnline, error: planeOffline, info: planeMovement, neutral: planeOffline },
  // scooter: { success: scooterOnline, error: scooterOffline, info: scooterMovement, neutral: scooterOffline },
  // ship: { success: shipOnline, error: shipOffline, info: shipMovement, neutral: shipOffline },
  // tractor: { success: tractorOnline, error: tractorOffline, info: tractorMovement, neutral: tractorOffline },
  // truck: { success: truckOnline, error: truckOffline, info: truckMovement, neutral: truckOffline },
  // van: { success: vanOnline, error: vanOffline, info: vanMovement, neutral: vanOffline },
  // smartphone: { success: smartphoneOnline, error: smartphoneOffline, info: smartphoneMovement, neutral: smartphoneOnline },
  // car: { success: carOnline, error: boatOffline, info: boatPng, neutral: boatPng },
  // truck: { success: truckPng, error: personPng, info: boatPng, neutral: boatPng },
  // motorcycle: { success: motorcyclePng, error: boatOffline, info: boatPng, neutral: boatPng },


};


export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const mapImages = {};

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = prepareIcon(background);
  mapImages.direction = prepareIcon(await loadImage(directionSvg));
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['info', 'success', 'error', 'neutral'].forEach(async (color) => {
      results.push(loadImage(mapIcons[category][color]).then((icon) => {
        mapImages[`${category}-${color}`] = prepareIcon(icon);
      }));
    });
    await Promise.all(results);
  }));
};
