const forEachAsync = async (array, callback) => {
  const promises = [];
  array.forEach((element, index) => {
    const promise = new Promise(async (resolve, reject) => {
      const result = await callback(element, index);
      resolve(result);
    });
    promises.push(promise);
  });
  return Promise.all(promises);
};

const forEachPromise = async (array, callback) => {
  let result = new Promise(resolve => resolve(1));
  array.forEach((element, i) => {
    result = result.then(() => callback(element, i));
  });
  return result;
};



const deepcopy = (object) => {
  let result = null
  try {
      result = JSON.parse(JSON.stringify(object))
  } catch(e) {
      console.log("Imposible to parse")
      result = null
  }
  return result
}