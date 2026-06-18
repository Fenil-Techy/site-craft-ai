export default function sitemap() {
    const baseUrl = 'https://www.craftportfolio.online';
  
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1.0,
      },
      // If you have other pages, add them here like this:
      // {
      //   url: `${baseUrl}/about`,
      //   lastModified: new Date(),
      //   changeFrequency: 'monthly',
      //   priority: 0.8,
      // },
    ];
  }