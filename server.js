const express = require('express');
const app = express();

app.use(express.static("public"));

//Listening routes
app.get('/', (req, res) => {
    res.sendFile("./public/textEditor.html", { root: __dirname })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});