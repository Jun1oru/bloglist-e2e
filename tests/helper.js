const loginWith = async (page, username, password) => {
  await page.getByTestId('inputUsername').fill(username);
  await page.getByTestId('inputPassword').fill(password);
  await page.getByTestId('loginButton').click();
};

const createBlog = async (page, blog) => {
  await page.getByRole('button', { name: 'new blog' }).click();
  await page.getByTestId('inputTitle').fill(blog.title);
  await page.getByTestId('inputAuthor').fill(blog.author);
  await page.getByTestId('inputUrl').fill(blog.url);
  await page.getByTestId('createBlog').click();
  await page.getByText(`${blog.title} ${blog.author}`).waitFor();
};

const showBlogDetails = async (page, blog) => {
  const locator = await page.locator('.blog').filter({
    hasText: `${blog.title} ${blog.author}`,
  });
  await locator.getByRole('button', { name: 'show' }).click();
  await locator.getByText(blog.url).waitFor();
};

const hideBlogDetails = async (page, blog) => {
  const locator = await page.locator('.blog').filter({
    hasText: `${blog.title} ${blog.author}`,
  });
  await locator.getByRole('button', { name: 'hide' }).click();
  await locator.getByRole('button', { name: 'show' }).waitFor();
};

const likeBlog = async (page, blog, times) => {
  await showBlogDetails(page, blog);
  for (let i = 0; i < times; i++) {
    await page.getByRole('button', { name: 'like' }).click();
    await page.getByText(`likes ${blog.likes + 1}`).waitFor();
    blog.likes++;
  }
  await hideBlogDetails(page, blog);
};

const initialUsers = [
  {
    name: 'Superuser',
    username: 'root',
    password: 'hardToGuess',
  },
  {
    name: 'Testuser',
    username: 'test',
    password: 'pa$$word',
  },
];

const initialBlogs = [
  {
    title: 'A good blog',
    author: 'Ada Lovelace',
    url: 'https://www.lovelace.com',
    likes: 0,
  },
  {
    title: 'What is this?',
    author: 'Abraham Lincoln',
    url: 'https://www.lincoln.com',
    likes: 0,
  },
  {
    title: 'Another blog',
    author: 'Anonymous',
    url: 'https://www.anonymous.com',
    likes: 0,
  },
];

export {
  loginWith,
  createBlog,
  showBlogDetails,
  hideBlogDetails,
  likeBlog,
  initialUsers,
  initialBlogs,
};
