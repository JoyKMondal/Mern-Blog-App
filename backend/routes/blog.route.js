const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

const blogsControllers = require("../controllers/blog.controller");

const router = express.Router();

router.get("/latest-blogs", blogsControllers.getLatestBlogs);
router.get("/trending-blogs", blogsControllers.getTrendingBlogs);
router.post("/search-blogs", blogsControllers.postSearchBlogs);
router.post("/search-users", blogsControllers.getUsersByBlogTags);
router.post("/user-blogs", blogsControllers.postUserBlogs);

router.post("/all-blogs", [checkAuth], blogsControllers.getAllBlogs);

router.post("/blog-details", blogsControllers.getBlogById);

router.post("/get-blog-comments", blogsControllers.getBlogComments);

router.use(checkAuth);

router.post(
  "/create-blog",
  [
    check("title").notEmpty(),
    check("description").notEmpty().isLength({ max: 200 }),
    check("banner").notEmpty(),
    check("content").notEmpty(),
    check("tags").notEmpty().isLength({ max: 10 }),
  ],
  blogsControllers.createBlog
);

router.delete("/delete-blog", blogsControllers.deleteBlogs);

router.post("/toggle-like-blog", blogsControllers.toggleLikeBlog);

router.get("/is-liked/:blogId", blogsControllers.checkUserLike);

router.post("/comment-blog", blogsControllers.commentBlog);

module.exports = router;
