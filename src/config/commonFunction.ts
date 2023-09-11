import crypto from "crypto";

const checkHasOwnProperty = async (item: any, checkArr: any) => {
  if (typeof item === "object") {
    let allKeyExist = true;
    let checkObject = item;
    checkArr.forEach(async (element: string) => {
      if (typeof checkObject === "object") {
        if (typeof element === "string") {
          if (checkObject.hasOwnProperty(element)) {
            checkObject = checkObject[element];
          } else {
            allKeyExist = false;
          }
        }
      } else {
        allKeyExist = false;
      }
    });
    return allKeyExist;
  }
  return false;
};

const isEmpty = (object: any) => {
  if (object == null || object == undefined) return true;
  else return Object.keys(object).length === 0;
};

const randomString = (size = 64) => {
  return crypto.randomBytes(size).toString("hex");
};

const generateFileName = () => {
  const d = new Date();
  const curr_date = d.getDate();
  const curr_month = d.getMonth() + 1; //Months are zero based
  const curr_year = d.getFullYear();

  const seconds = d.getSeconds();
  const minutes = d.getMinutes();
  const hour = d.getHours();

  const milisec = d.getMilliseconds();

  return (
    curr_year.toString() +
    curr_month.toString() +
    curr_date.toString() +
    hour.toString() +
    minutes.toString() +
    seconds.toString() +
    milisec.toString()
  );
};

const isStringNullOrEmpty = (str: string | null | undefined) => {
  return str == null || str.trim() === "";
};

export {
  checkHasOwnProperty,
  isEmpty,
  randomString,
  generateFileName,
  isStringNullOrEmpty,
};
