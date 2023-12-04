const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
    .connect("mongodb+srv://itzrick620:Sths2022@cluster0.ckyowgv.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch((error) => console.log("Couldn't connect to mongodb", error));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const apeSchema = new mongoose.Schema({
    name:String,
    sciName:String,
    divergeDate:String,
    location:String,
    apeType:String,
    img:String,
    funFacts:[String]
});

const Ape = mongoose.model("Ape", apeSchema);

/*let apes = [{
        _id: 1,
        name: "Orangutan",
        sciName: "Pongo",
        divergeDate: "14 million years ago",
        location: "Tropical Rainforests on the islands of Sumatra and Borneo",
        img: "images/orangutan.png",
        apeType: "Great Ape",
        funFacts: [
            "There are two species of orangutan: Bornean (Pongo pygmaeus) and Sumatran (Pongo abelii)",
            "Orangutans can live up to 60 years or more",
            "The largest tree dwelling mammals are orangutans",
        ],
    },
    {
        _id: 2,
        name: "Gorilla",
        sciName: "Gorilla",
        divergeDate: "8 to 19 million years ago",
        location: "Lowland Tropical Rainforests in Central Africa",
        img: "images/gorilla.png",
        apeType: "Great Ape",
        funFacts: [
            "The two types of gorilla (Eastern and Western) live in isolated groups about 560 miles apart",
            "Humans share 98% of their DNA with gorillas",
            "In an effort to create super soldiers, Josef Stalin tried to splice human DNA and gorilla DNA in the 1920's",
        ],
    },
    {
        _id: 3,
        name: "Common Chimpanzee",
        sciName: "Pan troglodytes",
        divergeDate: "4 to 6 million years ago",
        location: "Forest and savannah of tropical Africa",
        img: "images/chimp.png",
        apeType: "Great Ape",
        funFacts: [
            "Chimpanzees are the closest relaties to humans",
            "Chimpanzees can live up to 80 years",
            "Chimps have complex family and social structures",
        ],
    },
    {
        _id: 4,
        name: "Gibbon",
        sciName: "Hylobatidae",
        divergeDate: "16.8 million years ago",
        location: "Rainforests of southern Asia",
        img: "images/gibbon.png",
        apeType: "Lesser Ape",
        funFacts: [
            "Gibbons are the world's smallest ape",
            "Gibbons can swing as far as 15 meters in one go and they rarely touch the ground",
            "Gibbons are one of the most threatened primate families",
        ],
    },
    {
        _id: 5,
        name: "Bonobo",
        sciName: "Pan paniscus",
        divergeDate: "1.8 million years ago",
        location: "Forests south of the Congo River in the Democratic Republic of Congo",
        img: "images/bonobo.png",
        apeType: "Great Ape",
        funFacts: [
            "Bonobos can jump 28 inches into the air",
            "Bonobos are a matriarchal species rather than patriarchal",
            "They are a smaller, leaner version of the common chimpanzee",
        ],
    },
    {
        _id: 6,
        name: "Siamang",
        sciName: "Symphalangus syndactylus",
        divergeDate: "17 million years ago",
        location: "Mountains of the Malay Peninsula and Sumatra in rainforests and monsoon forests",
        img: "images/siamang.png",
        apeType: "Lesser Ape",
        funFacts: [
            "Siamangs have a grayish/pinkish throat sac, which inflates during vocalizations",
            "Siamangs are highly social and live in groups dominated by a mated pair",
            "They are highly territorial",
        ],
    },
]; */

app.get("/api/apes", (req, res) => {
    getApes(res);
});

const getApes = async (res) => {
    const apes = await Ape.find();
    res.send(apes);
}

app.post("/api/apes", upload.single("img"), (req, res) => {
    const result = validateApe(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const ape = new Ape({
        name: req.body.name,
        sciName: req.body.sciName,
        divergeDate: req.body.divergeDate,
        location: req.body.location,
        apeType: req.body.apeType,
        funFacts: req.body.funFacts.split(",")
    })

    if (req.file) {
        ape.img = "images/" + req.file.filename;
    }
    
    createApe(ape, res);
});

const createApe = async (res, ape) => {
    const result = await ape.save();
    res.send(ape);
}

app.put("/api/apes/:id", upload.single("img"), (req, res) => {
    const result = validateApe(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateApe(req, res);
});

const updateApe = async (req, res) => {
    let fieldsToUpdate = {
        name: req.body.name,
        sciName: req.body.sciName,
        divergeDate: req.body.divergeDate,
        location: req.body.location,
        apeType: req.body.apeType,
        funFacts: req.body.funFacts.split(",")
    };

    if(req.file) {
        fieldsToUpdate.img = "images/" + req.file.filename;
    }

    const result = await Ape.updateOne({_id: req.params.id}, fieldsToUpdate);
    const ape = await Ape.findById(req.params.id);
    res.send(ape);
};

app.delete("/api/apes/:id", upload.single("img"), (req, res) => {
    removeApe(res, req.params.id);
});
const removeApe = async (res, id) => {
    const ape = await Ape.findByIdAndDelete(id);
    res.send(ape);
}

const validateApe = (ape) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        funFacts: Joi.allow(""),
        name: Joi.string().min(3).required(),
        location: Joi.string().min(3).required(),
        apeType: Joi.string().min(3).required(),
        sciName: Joi.string().min(3).required(),
        divergeDate: Joi.string().required()
    });

    return schema.validate(ape);
};

app.listen(3000, () => {
    console.log("I'm listening");
});