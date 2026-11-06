# frozen_string_literal: true

module Kubik
  module Wysiwyg
    module LinkResolver
      module_function

      def normalize_row(row, href_resolver: default_href_resolver)
        row = row.with_indifferent_access
        text = row[:text].presence || row[:link_text]
        target = row[:target].presence
        rel = row[:rel].presence
        style = row[:style]

        url = row[:url].to_s.strip.presence
        nav = parse_nav_ref(row[:nav_link])
        stale = false
        broken = false

        if url.blank? && nav.present?
          resolved = resolve_nav_href(nav, href_resolver: href_resolver)
          url = resolved[:url]
          stale = resolved[:stale]
          broken = resolved[:broken]
          target ||= nav[:target].presence
          rel ||= nav[:rel].presence
          text ||= nav[:text].presence
          style = style.presence || nav[:style].presence
        end

        return nil if text.blank? && url.blank?

        result = {
          text: text,
          url: url,
          target: target,
          rel: rel,
          style: style,
        }.compact
        result[:stale] = true if stale
        result[:broken] = true if broken
        result
      end

      def normalize_rows(rows, href_resolver: default_href_resolver)
        Array.wrap(rows).filter_map { |row| normalize_row(row, href_resolver: href_resolver) }
      end

      def normalize_content_link(content, href_resolver: default_href_resolver)
        content = content.with_indifferent_access
        link_rows = Array.wrap(content[:links]).reject(&:blank?)
        if link_rows.any?
          row = normalize_row(link_rows.first, href_resolver: href_resolver)
          return row if row
        end

        nav = parse_nav_ref(content[:nav_link])
        style = content[:style].presence || content[:link_style].presence
        style ||= nav&.dig(:style).presence
        if nav.present?
          row = normalize_row(
            {
              nav_link: nav,
              text: content[:link_text].presence || nav[:text],
              target: content[:target].presence || nav[:target],
              rel: content[:rel].presence || nav[:rel],
              style: style,
            },
            href_resolver: href_resolver,
          )
          return row if row
        end

        text = content[:link_text].presence
        url = content[:link].to_s.strip.presence
        target = content[:target].presence
        rel = content[:rel].presence
        return nil if text.blank? && url.blank?

        { text: text, url: url, target: target, rel: rel, style: style }.compact
      end

      def parse_nav_ref(raw)
        case raw
        when Hash
          raw.with_indifferent_access
        when String
          return {} if raw.blank?

          JSON.parse(raw).with_indifferent_access
        else
          nil
        end
      rescue JSON::ParserError
        nil
      end

      def resolve_nav_href(nav, href_resolver: default_href_resolver)
        if defined?(Kubik::Navigable::LinkReference)
          Kubik::Navigable::LinkReference.resolve_href(
            nav,
            resolver: href_resolver || Kubik::Navigable::LinkReference.default_resolver,
          )
        else
          url = href_resolver&.call(nav)
          url ||= nav[:href].to_s.strip.presence if nav[:kind].to_s == "url"
          url ||= nav[:resolved_href].to_s.strip.presence
          { url: url, stale: false, broken: url.blank? }
        end
      end

      def default_href_resolver
        return nil unless defined?(Kubik::NavigableLinkHelper)

        helper = Object.new.extend(Kubik::NavigableLinkHelper)
        ->(ref) { helper.kubik_navigable_href(ref) }
      end
    end
  end
end
