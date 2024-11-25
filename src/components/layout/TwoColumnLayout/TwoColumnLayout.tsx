export const TwoColumnLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="py-24 flex justify-between w-full gap-40">{children}</div>
  );
};
