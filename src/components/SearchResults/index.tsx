"use client";

import { LocalizedContent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  Suspense,
  useContext,
  useState,
} from "react";

import { Link } from "@/lib/i18n";
import { VenueContext } from "@/lib/utils/VenueProvider";

import { useSearchQuery, useSearchResults } from "../Search/provider";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { Skeleton } from "../ui/Input/Skeleton";
import { getExcerpt } from "../utils";
import { ErrorBoundary } from "../utils/ErrorBoundary";

type FilterType = "events" | "profiles" | "pages" | "products";

const filterToPathMap = {
  events: "events",
  profiles: "artists",
  pages: "p",
  products: "shop",
};

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
  const [currentFilter, setCurrentFilter] = useState<FilterType>("events");

  const filteredResults = results?.[currentFilter] ?? [];

  return isQueryEnabled ? (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>filter</div>
          <ul className="flex flex-col gap-7">
            <FilterSelect
              setFilter={setCurrentFilter}
              value="events"
              currentValue={currentFilter}
              results={results}
            >
              events
            </FilterSelect>

            <FilterSelect
              setFilter={setCurrentFilter}
              value="profiles"
              currentValue={currentFilter}
              results={results}
            >
              profiles
            </FilterSelect>

            <FilterSelect
              setFilter={setCurrentFilter}
              value="pages"
              currentValue={currentFilter}
              results={results}
            >
              pages
            </FilterSelect>

            <FilterSelect
              setFilter={setCurrentFilter}
              value="products"
              currentValue={currentFilter}
              results={results}
            >
              shop
            </FilterSelect>
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
                  href={`/${filterToPathMap[currentFilter]}/${result.slug}`}
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
  results = {} as Record<FilterType, Array<any>>,
}: {
  children: ReactNode;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  value: FilterType;
  currentValue: FilterType;
  results: Record<FilterType, Array<any>>;
}) => {
  return (
    <li className="flex gap-8" onClick={() => setFilter(value)}>
      {currentValue === value ? <span>→</span> : null}
      {children}
      <span>[ {results[value]?.length ?? 0} ]</span>
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
