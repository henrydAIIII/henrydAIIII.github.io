import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const searchList = posts.map((post) => ({
		slug: post.id,
		title: post.data.title,
		description: post.data.description,
		pubDate: post.data.pubDate,
        tags: post.data.tags
	}));

	return new Response(JSON.stringify(searchList), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
