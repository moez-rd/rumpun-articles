import { getAllPublished, getSinglePost } from "@/lib/notion";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

const CodeBlock = ({ language, codestring }: any) => {
  return (
    <SyntaxHighlighter language={language} style={materialLight} PreTag="div">
      {codestring}
    </SyntaxHighlighter>
  );
};

export default function Articles({ post }: any) {
  return (
    <section className="max-w-3xl mx-auto my-40">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {post.metadata.title}
      </h1>
      <span>{post.metadata.date}</span>
      <div className="mt-20">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="text-sm">
                  <CodeBlock
                    codestring={String(children).replace(/\n$/, "")}
                    language={match[1]}
                  />
                </div>
              ) : (
                <code
                  className="relative rounded bg-gray-200 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-6 ml-6 list-disc [&>li]:mt-2 list-decimal">
                {children}
              </ol>
            ),
          }}
        >
          {post.markdown}
        </ReactMarkdown>
      </div>
    </section>
  );
}

/*
  Similarly to the blog overview page, you will be pre-rendering each post page.
  
  In /pages/posts/[slug].js, add the getStaticProps() function after the Post component and call the getSingleBlogPostBySlug function to fetch the blog post from Notion.
  */

export const getStaticProps = async ({ params }: any) => {
  const post = await getSinglePost(params.slug);

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};

export const getStaticPaths = async () => {
  const posts = await getAllPublished();
  const paths = posts.map(({ slug }: any) => ({ params: { slug } }));

  return {
    paths,
    fallback: "blocking",
  };
};
