const ValidarCUIT = (props) => {
  let inputString = "";
  let division = 0;
  inputString = props.toString();
  if (inputString.length === 11) {
    var Caracters_1_2 = inputString.charAt(0) + inputString.charAt(1);
    if (
      Caracters_1_2 === "20" ||
      Caracters_1_2 === "23" ||
      Caracters_1_2 === "24" ||
      Caracters_1_2 === "27" ||
      Caracters_1_2 === "30" ||
      Caracters_1_2 === "33" ||
      Caracters_1_2 === "34"
    ) {
      //   if (Caracters_1_2 === "23"){

      //   } Caracters_1_2 === "33") {

      //   } else {
      var Count =
        inputString.charAt(0) * 5 +
        inputString.charAt(1) * 4 +
        inputString.charAt(2) * 3 +
        inputString.charAt(3) * 2 +
        inputString.charAt(4) * 7 +
        inputString.charAt(5) * 6 +
        inputString.charAt(6) * 5 +
        inputString.charAt(7) * 4 +
        inputString.charAt(8) * 3 +
        inputString.charAt(9) * 2 +
        inputString.charAt(10) * 1;
      division = Count / 11;
      if (division === Math.floor(division)) {
        return true;
      } else {
        console.log("false1");
        return false;
      }
    }
    //}
  } else {
    console.log("false2");
    return false;
  }
};

export default ValidarCUIT;
