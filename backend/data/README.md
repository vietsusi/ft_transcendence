# Demo catalog

`wikidata-films.raw.json` is a compact snapshot of 80 films retrieved from the Wikidata Query Service on 2026-09-25. Structured data: CC0, https://www.wikidata.org/wiki/Wikidata:Licensing . Individual source URLs are stored on each imported movie.

Selection query: films (`wdt:P31 wd:Q11424`) with more than 40 sitelinks and a release after 1980; group by entity, take earliest matching publication date, sort entity ID, limit 80; retrieve English labels/descriptions and genre labels. This is a small demo sample, not a representative recommendation benchmark. Dates may represent festival or territory releases.

Cleaning: normalize whitespace and Unicode; reject missing/entity-ID titles and invalid years; deduplicate source IDs; map fine-grained genres to application genres; preserve unknown genres as Other; upsert by source ID or title/year. Existing IDs and poster URLs are preserved. The original 24 hand-authored demo records remain available, including TV series.

Catalog cards use text rather than requiring poster images. Descriptions are Wikidata metadata descriptions, not full plot summaries. Missing descriptions explicitly say unavailable. Re-running `prisma db seed` does not duplicate imported films.

```sparql
SELECT ?film ?filmLabel ?filmDescription ?date ?genreLabel WHERE {
  { SELECT ?film (MIN(?published) AS ?date) WHERE {
    ?film wdt:P31 wd:Q11424; wdt:P577 ?published; wikibase:sitelinks ?links.
    FILTER(?links > 40 && ?published > "1980-01-01T00:00:00Z"^^xsd:dateTime)
  } GROUP BY ?film ORDER BY ?film LIMIT 80 }
  OPTIONAL { ?film wdt:P136 ?genre }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
```

To refresh, run the same SPARQL selection against https://query.wikidata.org/sparql and normalize bindings into the checked-in snapshot shape before seeding. Normal startup uses the snapshot and requires no external dataset service.
