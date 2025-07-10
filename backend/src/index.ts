import express from "express";
import jwt from "jsonwebtoken";
import { UserModel, LinkModel, ContentModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.post("/api/v1/signup", async(req, res)=>{
    //todo: zod validation, hash password
    const username = req.body.username;
    const password = req.body.password;

    try{
    await UserModel.create({
        username : username,
        password : password
    })
    res.json({
        message: "User signed up"
    })
    } catch(e){
        res.status(411).json({
            message : "user already exists"
        })
    }
}) 

app.post("/api/v1/signin", async(req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrrect credentials"
        })
    }

})
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { link, type, title } = req.body;

    const newContent = await ContentModel.create({
      link,
      type,
      title,
      //@ts-ignore
      userId: req.userId,
      tags: []
    });

    res.status(201).json({
      message: "Content added",
      data: newContent
    });

  } catch (err) {
    console.error(" Error adding content:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})


app.listen(3000,()=> {console.log(`TS is compiling this!`);
});