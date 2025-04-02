"use client";

import { Dispatch, ReactNode, SetStateAction, useState } from "react";

import { useSearch } from "../Search/provider";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

type FilterType = "events" | "profiles" | "pages" | "products";

export const SearchResults = () => {
  const { query, results } = useSearch();
  const [currentFilter, setCurrentFilter] = useState<FilterType>("events");

  const filteredResults = results[currentFilter] ?? [];

  return (
    <TwoColumnLayout className="left-0 top-0 h-full w-full bg-background">
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <ul>
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
        {filteredResults.map((result) => (
          <div>
            <div>{result.localizedContent[0].title}</div>
            <div>{result.localizedContent[0].shortContent}</div>
          </div>
        ))}
        )
      </ColumnRight>
    </TwoColumnLayout>
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
