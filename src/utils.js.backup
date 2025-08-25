const {isObject, isEqual, transform, flattenDeep, isNumber, isFinite} = lodash;
export function differenceByObjects(object, base) {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] =
        isObject(value) && isObject(base[key])
          ? differenceByObjects(value, base[key])
          : value;
    }
  });
}

export function getMinPrice(korpus, roomId) {
  const allPrices = [];

  korpus.room.map((room) => {
    if (room.room_id === roomId) {
      // if(!room.hasOwnProperty('tariff')) {

      // }
      room.tariff?.map((tariff) => {
        tariff.booking_period.map((season) => {
          allPrices.push(
            Object.values(season.tsina_za_doroslyh)
              .filter((price) => price !== "" && price !== "-")
              .map((price) => parseFloat(price))
          );
        });
      });
    }
  });
//   console.log(allPrices);
  if (allPrices.length < 1) {
    return `Ціна від 0грн`;
  }
  const minPrice = isFinite(Math.min(...flattenDeep(allPrices)))
    ? Math.min(...flattenDeep(allPrices))
    : 0;
  return `Ціна від ${minPrice}грн`;
}
