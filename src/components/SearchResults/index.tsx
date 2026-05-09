"use client";

import { LocalizedContent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  Suspense,
  useState,
} from "react";

import { Link } from "@/lib/i18n";

import {
  SearchAllType,
  useSearchQuery,
  useSearchResults,
} from "../Search/provider";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { Skeleton } from "../ui/Input/Skeleton";
import { getExcerpt } from "../utils";
import { ErrorBoundary } from "../utils/ErrorBoundary";

type FilterType = SearchAllType | "all";

const typeToPathMap: Record<SearchAllType, string> = {
  event: "events",
  profile: "artists",
  page: "p",
  product: "shop",
};

const filterOptions: Array<{ value: FilterType; label: string }> = [
  { value: "all", label: "all" },
  { value: "event", label: "events" },
  { value: "profile", label: "profiles" },
  { value: "page", label: "pages" },
  { value: "product", label: "shop" },
];

export const SearchResultsLayout = ({ children }: PropsWithChildren) => {
  return (
    <ErrorBoundary fallback={<ErrorResults />}>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults>{children}</SearchResults>
      </Suspense>
    </ErrorBoundary>
  );
};

export const SearchResults = ({ children }: PropsWithChildren) => {
  const locale = useLocale();

  const { reset } = useSearchQuery();
  const { isQueryEnabled, results } = useSearchResults();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  const records = results?.records ?? [];
  const counts = records.reduce(
    (acc, record) => {
      acc[record.type] = (acc[record.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<SearchAllType, number>,
  );

  const filteredResults =
    currentFilter === "all"
      ? records
      : records.filter((record) => record.type === currentFilter);

  return isQueryEnabled ? (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>filter</div>
          <ul className="flex flex-col gap-7">
            {filterOptions.map((option) => (
              <FilterSelect
                key={option.value}
                setFilter={setCurrentFilter}
                value={option.value}
                currentValue={currentFilter}
                count={
                  option.value === "all"
                    ? records.length
                    : (counts[option.value] ?? 0)
                }
              >
                {option.label}
              </FilterSelect>
            ))}
          </ul>
        </div>
      </ColumnLeft>

      <ColumnRight>
        <ListContainer>
          {filteredResults.map((result) => {
            const { content } = getLocalizedContent(
              result.localizedContent as Array<LocalizedContent>,
              locale,
            );
            return (
              <div className="flex flex-col gap-3" key={result.id}>
                <Link
                  href={`/${typeToPathMap[result.type]}/${result.slug}`}
                  onClick={reset}
                >
                  <div className="text-secondary">{content.title}</div>
                  <div>
                    {content.shortContent ?? getExcerpt(content.content)}
                  </div>
                </Link>
              </div>
            );
          })}
        </ListContainer>
      </ColumnRight>
    </TwoColumnLayout>
  ) : (
    children
  );
};

const FilterSelect = ({
  children,
  setFilter,
  value,
  currentValue,
  count,
}: {
  children: ReactNode;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  value: FilterType;
  currentValue: FilterType;
  count: number;
}) => {
  return (
    <li className="flex gap-8" onClick={() => setFilter(value)}>
      {currentValue === value ? <span>→</span> : null}
      {children}
      <span>[ {count} ]</span>
    </li>
  );
};

const ListContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-12">{children}</div>;
};

export const SearchResultsSkeleton = () => {
  return (
    <TwoColumnLayout>
      <ColumnLeft></ColumnLeft>

      <ColumnRight>
        <ListContainer>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8" />
            </div>
          ))}
        </ListContainer>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

const ErrorResults = () => {
  return (
    <TwoColumnLayout>
      <ColumnLeft></ColumnLeft>
      <ColumnRight>
        Something went wrong while searching... try again?
      </ColumnRight>
    </TwoColumnLayout>
  );
};
