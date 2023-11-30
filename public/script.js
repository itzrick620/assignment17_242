const getApes = async() => {
  try {
      return (await fetch("api/apes/")).json();
  } catch (error) {
      console.log(error);
  }
};

const showApes = async () => {
  try {
      let apes = await getApes();
      let apesDiv = document.getElementById("ape-list");
      apesDiv.innerHTML = "";
      apes.forEach((ape) => {
          const section = document.createElement("section");
          section.classList.add("ape");
          apesDiv.append(section);

          const a = document.createElement("a");
          a.href = "#";
          section.append(a);

          const h3 = document.createElement("h3");
          h3.innerHTML = ape.name;
          a.append(h3);

          const img = document.createElement("img");
          img.src = ape.img;
          section.append(img);

          a.onclick = (e) => {
              e.preventDefault();
              displayDetails(ape);
          };
      });
  } catch (error) {
      console.log(error);
  }
};


const displayDetails = (ape) => {
  const apeDetails = document.getElementById("ape-details");
  apeDetails.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.innerHTML = ape.name;
  apeDetails.append(h3);

  const dLink = document.createElement("a");
  dLink.innerHTML = "Delete";
  apeDetails.append(dLink);
  dLink.id = "delete-link";

  const eLink = document.createElement("a");
  eLink.innerHTML = "Edit";
  apeDetails.append(eLink);
  eLink.id = "edit-link";

  const sciName = document.createElement("p");
  apeDetails.append(sciName);
  sciName.innerHTML = ape.sciName;

  const date = document.createElement("p");
  apeDetails.append(date);
  date.innerHTML = ape.divergeDate;

  const location = document.createElement("p");
  apeDetails.append(location);
  location.innerHTML = ape.location;

  const apeType = document.createElement("p");
  apeDetails.append(apeType);
  apeType.innerHTML = ape.apeType;

  const ul = document.createElement("ul");
  apeDetails.append(ul);
  console.log(ape.funFacts);
  ape.funFacts.forEach((fact) => {
      const li = document.createElement("li");
      ul.append(li);
      li.innerHTML = fact;
  });

  eLink.onclick = (e) => {
      e.preventDefault();
      document.querySelector(".dialog").classList.remove("transparent");
      document.getElementById("add-edit-title").innerHTML = "Edit Ape";
  };

  dLink.onclick = (e) => {
      e.preventDefault();
      deleteApe(ape);
  };

  populateEditForm(ape);
};

const deleteApe = async(ape) => {
  let response = await fetch(`/api/apes/${ape._id}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json"
      }
  });

  if (response.status != 200) {
      console.log("error deleting");
      return;
  }

  let result = await response.json();
  showApes();
  document.getElementById("ape-details").innerHTML = "";
  resetForm();
}

const populateEditForm = (ape) => {
  const form = document.getElementById("add-edit-ape-form");
  form._id.value = ape._id;
  form.name.value = ape.name;
  form.sciName.value = ape.sciName;
  form.divergeDate.value = ape.divergeDate;
  form.location.value = ape.location;
  form.apeType.value = ape.apeType;
  populateFact(ape)
};

const populateFact = (ape) => {
  const section = document.getElementById("facts-boxes");
  section.innerHTML = ""; //clears existing fields

  ape.funFacts.forEach((fact) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = fact;
      section.append(input);
  });
};

const addEditApe = async(e) => {
  e.preventDefault();
  const form = document.getElementById("add-edit-ape-form");
  const formData = new FormData(form);
  let response;
  formData.append("funFacts", JSON.stringify(getFacts()));

  if (form._id.value == -1) {
      formData.delete("_id");

      response = await fetch("/api/apes", {
          method: "POST",
          body: formData
      });
  } else {
      console.log(...formData);

      response = await fetch(`/api/apes/${form._id.value}`, {
          method: "PUT",
          body: formData
      });
  }

  //successfully got data from server
  if (response.status != 200) {
      console.log("Error posting data");
  }

  ape = await response.json();

  if (form._id.value != -1) {
      displayDetails(ape);
  }

  resetForm();
  document.querySelector(".dialog").classList.add("transparent");
  showApes();
};

const getFacts = () => {
  const inputs = document.querySelectorAll("#facts-boxes input");
  let funFacts = [];

  inputs.forEach((input) => {
    funFacts.push(input.value);
  });

  return funFacts;
};

const resetForm = () => {
  const form = document.getElementById("add-edit-ape-form");
  form.reset();
  form._id = "-1";
  document.getElementById("facts-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
  e.preventDefault();
  document.querySelector(".dialog").classList.remove("transparent");
  document.getElementById("add-edit-title").innerHTML = "Add Ape";
  resetForm();
};

const addFact = (e) => {
  e.preventDefault();
  const section = document.getElementById("facts-boxes");
  const input = document.createElement("input");
  input.type = "text";
  section.append(input);
}

window.onload = async () => {
  try {
      await showApes();
      document.getElementById("add-edit-ape-form").onsubmit = addEditApe;
      document.getElementById("add-link").onclick = showHideAdd;

      document.querySelector(".close").onclick = () => {
          document.querySelector(".dialog").classList.add("transparent");
      };

      document.getElementById("add-facts").onclick = addFact;
  } catch (error) {
      console.log(error);
  }
};