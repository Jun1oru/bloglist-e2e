const {
  test,
  expect,
  beforeEach,
  describe,
  browser,
} = require('@playwright/test');
const {
  loginWith,
  createBlog,
  showBlogDetails,
  hideBlogDetails,
  likeBlog,
  initialUsers,
  initialBlogs,
} = require('./helper');

describe('Blog app', () => {
  const testUser = {
    name: 'Testuser',
    username: 'test',
    password: 'pa$$word',
  };

  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    for (const user of initialUsers) {
      await request.post('/api/users', {
        data: user,
      });
    }
    await page.goto('');
  });

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByTestId('loginHeader');
    await expect(locator).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password);
      await expect(page.getByTestId('loggedDiv')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, testUser.username, 'wrong');

      const notification = await page.getByTestId('notification');
      await expect(notification).toContainText(
        'invalid username or password'
      );
      await expect(notification).toHaveCSS(
        'border',
        '2px solid rgb(255, 0, 0)'
      );
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)');

      await expect(page.getByTestId('loggedDiv')).not.toBeVisible();
    });
  });

  describe('Logout', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password);
      await expect(page.getByTestId('loggedDiv')).toBeVisible();
    });

    test('when logout button is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'logout' }).click();
      await expect(page.getByTestId('loginHeader')).toBeVisible();
    });
  });

  describe('Blog Functions', () => {
    describe('Create Function', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, testUser.username, testUser.password);
        await page.getByTestId('loggedDiv').waitFor();

        for (const blog of initialBlogs) {
          await createBlog(page, blog);
        }
      });

      test('several blogs can be created when logged in', async ({
        page,
      }) => {
        for (const blog of initialBlogs) {
          await expect(
            page.getByText(`${blog.title} ${blog.author}`)
          ).toBeVisible();
        }
      });
    });

    describe('Show blog details', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, testUser.username, testUser.password);
        await page.getByTestId('loggedDiv').waitFor();

        for (const blog of initialBlogs) {
          await createBlog(page, blog);
        }
      });

      test('details are hidden if button has not been clicked', async ({
        page,
      }) => {
        for (const blog of initialBlogs) {
          await expect(page.getByText(blog.url)).not.toBeVisible();
        }
      });

      test('when show button is clicked', async ({ page }) => {
        const testBlog = initialBlogs[0];
        await showBlogDetails(page, testBlog);

        await expect(page.getByText(testBlog.url)).toBeVisible();
        await expect(
          page.getByText(`likes ${testBlog.likes}`)
        ).toBeVisible();
        await expect(
          page.getByText(testUser.name, { exact: true })
        ).toBeVisible();
      });
    });

    describe('Like blog', () => {
      const testBlog = initialBlogs[0];
      beforeEach(async ({ page }) => {
        await loginWith(page, testUser.username, testUser.password);
        await page.getByTestId('loggedDiv').waitFor();

        for (const blog of initialBlogs) {
          await createBlog(page, blog);
        }
      });

      test('when like button is clicked', async ({ page }) => {
        await likeBlog(page, testBlog, 1);
      });

      test('several blogs created are arranged in the order according the likes', async ({
        page,
      }) => {
        await likeBlog(page, initialBlogs[2], 5);
        await likeBlog(page, initialBlogs[1], 3);

        const headers = await page.locator('.blogHeader').all();
        const sortBlogs = initialBlogs.sort(function (a, b) {
          return b.likes - a.likes;
        });
        for (const [index, header] of headers.entries()) {
          const element = header.getByText(
            `${sortBlogs[index].title} ${sortBlogs[index].author}`
          );
          await expect(element).toBeVisible();
        }
      });
    });

    describe('Delete blog', () => {
      const testBlog = initialBlogs[0];
      beforeEach(async ({ page }) => {
        await loginWith(page, testUser.username, testUser.password);
        await page.getByTestId('loggedDiv').waitFor();

        for (const blog of initialBlogs) {
          await createBlog(page, blog);
        }
        await showBlogDetails(page, testBlog);
      });

      test('when logged user is not creator of blog delete button is hidden', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'logout' }).click();
        await page.getByTestId('loginHeader').waitFor();

        await loginWith(
          page,
          initialUsers[0].username,
          initialUsers[0].password
        );
        await page.getByTestId('loggedDiv').waitFor();
        await showBlogDetails(page, testBlog);
        await expect(
          page.getByRole('button', { name: 'delete' })
        ).not.toBeVisible();
      });

      test('when delete button is clicked', async ({ page }) => {
        const deleteButton = await page.getByRole('button', {
          name: 'delete',
        });
        await expect(deleteButton).toBeVisible();

        page.on('dialog', (dialog) => dialog.accept());
        await deleteButton.click();

        const blog = page.locator('.blog').filter({
          hasText: `${testBlog.title} ${testBlog.author}`,
        });
        await expect(blog).not.toBeVisible();
      });
    });
  });
});
