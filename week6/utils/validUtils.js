const isUndefined = (value) => {
    return value === undefined
  }

const isNotValidSting = (value)=> {
    return typeof value !== "string" || value.trim().length === 0 || value === ""
  }
  
 const isNotValidInteger = (value)=> {
    return typeof value !== "number" || value < 0 || value %1 !== 0
  }

  module.exports = {
    isUndefined,
    isNotValidSting,
    isNotValidInteger
  }
  