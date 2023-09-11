const axios = require('axios');

async function shareboost(event, api) {
  const input = event.body;

  if (input.includes('-help')) {
    const usage = "Usage: shareboost [access_token] [url]\n\n" +
      "Description: Share a post on Facebook multiple times.\n\n" +
      "Example: shareboost EAAD6V7 https:// fb.me/story.php\n\n" +
      "Note: This command will repeatedly share the specified URL on your Facebook feed.";
    api.sendMessage(usage, event.threadID, event.messageID);
    return;
  }

  const args = input.split(' ');

  if (args.length !== 3) {
    api.sendMessage('Invalid usage. Please type `shareboost -help` for usage example.', event.threadID);
    return;
  }

  const accessToken = args[1];
  const shareUrl = args[2];
  const shareCount = 22200;
  const timeInterval = 5000;
  const deleteAfter = 60 * 60;

  let sharedCount = 0;
  let timer = null;

  api.sendMessage('Starting the share process...', event.threadID);

  async function sharePost() {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/me/feed?access_token=${accessToken}&fields=id&limit=1&published=0`,
        {
          link: shareUrl,
          privacy: { value: 'SELF' },
          no_story: true,
        },
        {
          muteHttpExceptions: true,
          headers: {
            authority: 'graph.facebook.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua-mobile': '?0',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
          },
          method: 'post',
        }
      );

      sharedCount++;
      const postId = response?.data?.id;

      console.log(`Post shared: ${sharedCount}\nPost ID: ${postId || 'Unknown'}`);

      if (sharedCount === shareCount) {
        clearInterval(timer);
        api.sendMessage('Finished sharing posts.', event.threadID);

        if (postId) {
          setTimeout(() => {
            deletePost(postId);
          }, deleteAfter * 1000);
        }
      }
    } catch (error) {
      console.error('Failed to share post:', error.response.data);
     console.log('Failed to share post. Please check your input and try again.', event.threadID);
    }
  }

  async function deletePost(postId) {
    try {
      await axios.delete(`https://graph.facebook.com/${postId}?access_token=${accessToken}`);
      console.log(`Post deleted: ${postId}`);
    } catch (error) {
      console.error('Failed to delete post:', error.response.data);
      api.sendMessage('Failed to delete post.', event.threadID);
    }
  }

  timer = setInterval(sharePost, timeInterval);

  setTimeout(() => {
    clearInterval(timer);
    console.log('Loop stopped.');
    api.sendMessage('Loop stopped.', event.threadID);
  }, shareCount * timeInterval);
}

module.exports = shareboost;