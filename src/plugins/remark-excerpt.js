// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";

const excerptLength = 200;

/* Use the start of the post body as the excerpt */
export function remarkExcerpt() {
	return (tree, { data }) => {
		const excerpt = tree.children
			.map((node) =>
				toString(node, {
					includeHtml: false,
					includeImageAlt: false,
				}),
			)
			.filter(Boolean)
			.join(" ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, excerptLength);

		data.astro.frontmatter.excerpt = excerpt;
	};
}
