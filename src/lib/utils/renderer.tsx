/*
 * Content Renderer with defaults
 * Adapted from tiptap-react-render: https://github.com/troop-dev/tiptap-react-render
 */
import { VenueImage } from "@/components";
import { LocalizedContent } from "@venuecms/sdk";
import Markdown from "markdown-to-jsx";
import { ReactNode } from "react";

type ElementClasses = {
  text?: string;
  p?: string;
  ul?: string;
  ol?: string;
  li?: string;
  code?: string;
  heading?: string;
  hardBreak?: string;
  img?: string;
  image?: string;
  iframe?: string;
  h1?: string;
  h2?: string;
  h3?: string;
  a?: string;
};

const marks = {
  bold: "font-bold",
  italic: "italic",
  underline: "underline",
  strike: "line-through",
  link: "underline underline-offset-[3px] cursor-pointer",
} as const;

const elMarks = {
  link: (props: any): ReactNode => <a {...props} />,
} as const;

const getDefaultHandlers = (classes: ElementClasses = {}) => {
  const defaultHandlers: NodeHandlers = {
    text: (props) => {
      if (props.node.marks) {
        const className = props.node.marks
          .reduce((accum, mark) => {
            return `${marks[mark.type as keyof typeof marks]} ${accum}`;
          }, "")
          .trim();

        let hasWrappers = false;
        const elWrappers = props.node.marks.reduce((accum, mark) => {
          if (mark.type in elMarks) {
            hasWrappers = true;
            const el = elMarks[mark.type as keyof typeof elMarks];

            return el({ ...mark.attrs, className, children: accum });
          }
        }, props.node.text);

        if (hasWrappers) {
          return elWrappers;
        }

        return <span className={`${className}`}>{props.node.text}</span>;
      }

      if (classes.text) {
        <span className={classes.text}>{props.node.text}</span>;
      }

      return <>{props.node.text}</>;
    },
    paragraph: (props) => <p className={classes.p}>{props.children}</p>,
    bulletList: (props) => <ul className={classes.ul}>{props.children}</ul>,
    orderedList: (props) => <ol className={classes.ol}>{props.children}</ol>,
    listItem: (props) => <li className={classes.li}>{props.children}</li>,
    codeBlock: (props) => (
      <pre>
        <code className={classes.code}>{props.children}</code>
      </pre>
    ),
    heading: (props) => {
      switch (props.node.attrs?.level) {
        case 1:
          return <h1 className={classes.h1}>{props.children}</h1>;
        case 2:
          return <h2 className={classes.h2}>{props.children}</h2>;
        case 3:
          return <h3 className={classes.h3}>{props.children}</h3>;
        default:
          return <>{props.children}</>;
      }
    },
    hardBreak: () => <p></p>,
    image: (props) => {
      const { src, alt } = props.node.attrs ?? {};

      const image = {
        url: src.split(/^\/media\//).join(""),
        metadata: {
          altText: alt,
        },
      };

      return <VenueImage className={classes.image} image={image} />;
    },
    img: (props) => {
      const { src, alt } = props.node;
      const image = {
        url: src.split(/^\/media\//).join(""),
        metadata: {
          altText: alt,
        },
      };
      return <VenueImage className={classes.img} image={image} />;
    },
    youtube: (props) => {
      //@ts-ignore
      const { src, start } = props.node.attrs;
      const key = src.split("v=")[1];

      return (
        <iframe
          src={`https://www.youtube.com/embed/${key}?modestbranding=1${start ? `&amp;start=${start}` : ""}`}
          frameBorder="0"
          allowFullScreen={true}
          width="100%"
          height="auto"
          style={{
            aspectRatio: "4 / 3",
          }}
        ></iframe>
      );
    },
    iframe: (props) => {
      const {
        // @ts-ignore
        src,
        // @ts-ignore
        style,
        // @ts-ignore
        frameborder,
        // @ts-ignore
        allowfullscreen,
        // @ts-ignore
        referrerpolicy,
        ...rest
      } = props.node.attrs;

      const styles = style
        ?.split(";")
        .reduce((accum: Record<string, string>, style: string) => {
          const [key, value] = style.split(":");
          return { ...accum, [key]: value };
        }, {});

      return (
        <iframe
          src={src}
          style={styles}
          frameBorder={frameborder}
          allowFullScreen={allowfullscreen}
          referrerPolicy={referrerpolicy}
          {...rest}
        />
      );
    },
  } as const;
  return defaultHandlers;
};

const getMarkdownHandlers = (classes: ElementClasses = {}) => {
  const handlers = getDefaultHandlers(classes);
  // the markdown renderer uses a more standard format for overriding styles, so we map it here
  return {
    ...handlers,
    p: handlers.paragraph,
    ul: handlers.bulletList,
    ol: handlers.orderedList,
    li: handlers.listItem,
    code: handlers.codeBlock,
    h1: (props: any) =>
      handlers.heading({ ...props, node: { attrs: { level: 1 } } }),
    h2: (props: any) =>
      handlers.heading({ ...props, node: { attrs: { level: 2 } } }),
    h3: (props: any) =>
      handlers.heading({ ...props, node: { attrs: { level: 3 } } }),
    img: (props: any) =>
      handlers.image({
        ...props,
        node: { attrs: { src: props.src, alt: props.alt } },
      }),
    hr: (props: any) => <hr {...props} />,
    a: (props: any) => (
      <a href={props.href} className={classes.a}>
        {props.children}
      </a>
    ),
    span: ({ children }: { children: ReactNode }) => <span>{children}</span>, // strip out custom colors and all that (since they are usually pasted in accidentally)
  };
};

type ContentStyles = Partial<
  Record<keyof ReturnType<typeof getDefaultHandlers>, string>
>;

export const ContentRender = (props: {
  node: RenderNode;
  handlers?: NodeHandlers;
  classes?: ContentStyles;
}): JSX.Element => {
  const { node, handlers: handlerOverrides = {} } = props;
  const handlers = {
    ...getDefaultHandlers(props.classes),
    ...handlerOverrides,
  };

  // recursively render child content
  const children: JSX.Element[] = [];
  node.content &&
    node.content.forEach((child, ix) => {
      children.push(
        <ContentRender
          node={child}
          handlers={handlers}
          key={`${child.type}-${ix}`}
        />,
      );
    });

  // return empty if we are missing a handler for this type
  if (!(node.type in handlers)) {
    console.warn(`missing type`, node);
    return <></>;
  }
  // render the handler for this type
  const Handler = handlers[node.type];
  return <Handler node={node}>{children}</Handler>;
};

export const VenueContent = ({
  content,
  contentStyles,
  className,
}: {
  content: LocalizedContent;
  contentStyles?: ContentStyles;
  className?: string;
}) => {
  const { contentJSON } = content;

  if (contentJSON) {
    return (
      <div className={className}>
        {(contentJSON.content as Array<RenderNode>).map((node, i) => (
          <ContentRender key={i} classes={contentStyles} node={node} />
        ))}
      </div>
    );
  }

  if (content.content) {
    return (
      <Markdown
        className={className}
        options={{
          overrides: {
            ...getMarkdownHandlers(contentStyles),
          },
        }}
      >
        {
          /* There are issues with <hr> tags in the parsing so we fix that with a regex */
          content.content.replaceAll(
            /(?:\n|\r\n)\*\*\*(?:\n|\r\n)/g,
            "\n\n***\n\n",
          )
        }
      </Markdown>
    );
  }

  return null;
};

interface Attrs {
  readonly [attr: string]: any;
}

export interface RenderNode {
  type: string;
  attrs?: Attrs;
  marks?: Attrs[];
  content?: RenderNode[];
  readonly [attr: string]: any;
}

export interface NodeProps {
  children?: React.ReactNode;
  node: RenderNode;
}

export type NodeHandler = (props: NodeProps) => JSX.Element;

export interface NodeHandlers {
  readonly [attr: string]: NodeHandler;
}
