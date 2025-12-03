// routes/index.js
var express = require("express");
var router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /
 * トップページ
 * - 全投稿を新しい順に表示
 */
router.get("/", async function (req, res, next) {
  try {
    const posts = await prisma.post.findMany({ //全部を取得する
      orderBy: { postedAt: "desc" },  //descは新しい順
    });

    res.render("index", { posts: posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

/**
 * POST /
 * 新規記事投稿
 */
router.post("/", async function (req, res, next) { //フォームを送信したときに送られるリクエスト
  try {
    const title = req.body.title;
    const date = req.body.postedAt; // <input type="date"> の値=日付
    const content = req.body.content;

    const postedAt = new Date(date); // Date型に変換

    await prisma.post.create({ 
      data: {
        title: title,
        postedAt: postedAt,
        content: content,
      },
    });

    res.redirect("/"); // 投稿したらトップに戻る
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

/**
 * POST /search
 * 検索結果ページ（POSTのみ）
 */
router.post("/search", async function (req, res, next) {
  try {
    const keyword = req.body.keyword || "";

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: { //titleにキーワードがある場合
              contains: keyword,
            },
          },
          {
            content: { //contentにキーワードがある場合
              contains: keyword,
            },
          },
        ],
      },
      orderBy: { postedAt: "desc" },  //descは新しい順
    });

    res.render("search", { posts: posts, keyword: keyword });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

module.exports = router;
