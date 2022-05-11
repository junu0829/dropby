const router = require("express").Router();

const auth = require("./authRouter");
const area = require("./areaRouter");

router.use("/auth", auth);
router.use("/", area);

module.exports = router;