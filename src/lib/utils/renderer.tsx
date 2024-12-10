/*
 * Content Renderer with defaults
 * Adapted from tiptap-react-render: https://github.com/troop-dev/tiptap-react-render
 */
import { VenueImage } from "@/components";

type ElementClasses = {
  text?: string;
  p?: string;
  ul?: string;
  ol?: string;
  li?: string;
  code?: string;
  heading?: string;
  img?: string;
  iframe?: string;
  h1?: string;
  h2?: string;
  h3?: string;
};

const marks = {
  bold: "font-bold",
  italic: "italic",
  underline: "underline",
  strike: "line-through",
} as const;

const getDefaultHandlers = (classes: ElementClasses = {}) => {
  const defaultHandlers: NodeHandlers = {
    text: (props) => {
      if (props.node.marks) {
        const className = props.node.marks.reduce((accum, mark) => {
          return `${marks[mark.type]} ${accum}`;
        }, "");

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
    img: (props) => {
      const { src, alt } = props.node;
      return (
        <VenueImage
          className={classes.img}
          image={{
            url: src,
            metadata: {
              altText: alt,
            },
          }}
        />
      );
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

export function ContentRender(props: {
  node: RenderNode;
  handlers?: NodeHandlers;
  classes?: Partial<
    Record<keyof ReturnType<typeof getDefaultHandlers>, string>
  >;
}): JSX.Element {
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
}

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
