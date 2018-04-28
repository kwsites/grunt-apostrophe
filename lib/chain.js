
module.exports = function chain (items, builder, callback) {
   const chain = items.reduce((chain, item, index) =>
      chain.then(() => builder(item, index, items)), Promise.resolve());

   if (typeof callback === 'function') {
      chain.then(() => callback(null)).catch((e) => callback(e));
   }

   return chain;
};
