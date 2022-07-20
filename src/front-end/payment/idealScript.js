console.log("IDEAL:");
http(
  {
    method: "GET",
    route: "/getIdealIssuers",
    body: {}
  },
  data => {
    let issuersArr = data.countries[0].issuers;
    let idealLabel = document.createElement("LABEL");

    idealLabel.setAttribute("for", "cars");
    idealLabel.innerHTML = "Choose an issuer:";
    let idealSelect = document.createElement("SELECT");
    idealSelect.setAttribute("name", "issuers");
    idealSelect.setAttribute("id", "issuers");
    for (let i = 0; i < issuersArr.length; i++) {
      let idealOption = document.createElement("Option");
      idealOption.setAttribute("value", issuersArr[i].bic);
      idealOption.innerHTML = issuersArr[i].bic;
      idealSelect.appendChild(idealOption);
    }
    idealSelector.appendChild(idealSelect);
  }
);

// iDeal
idealBtn.addEventListener("click", () => {
  var id = document.getElementById("issuers");
  var idText = id.options[id.selectedIndex].text;
  payIdeal(idText);
});

const payIdeal = issuer_id => {
  http(
    {
      method: "POST",
      route: "/payWithIdeal",
      body: {
        issuer_id: issuer_id,
        url: window.location.origin
      }
    },
    data => {
      payLoader.classList.add("hide");
      console.log(data.redirectLink);
      window.location = data.redirectLink;
      console.log("API RESPONSE: ", data);
      // handleResponse(data);
    }
  );
};
