/**
 * GDS Driving School — DataTable Component
 * ===========================================
 * Professional data table with sortable columns, themed rows, and actions.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

export interface TableColumn<T> {
  header: string;
  key: string;
  width?: number;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowPress?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: string;
  maxRows?: number;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  emptyMessage = 'No data available',
  emptyIcon = 'document-text-outline',
  maxRows,
}: DataTableProps<T>) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedData = useMemo(() => {
    let result = [...data];
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortAsc ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        return sortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    if (maxRows) {
      result = result.slice(0, maxRows);
    }
    return result;
  }, [data, sortKey, sortAsc, maxRows]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map(col => (
        <Pressable
          key={col.key}
          style={[styles.headerCell, col.width ? { width: col.width } : { flex: 1 }]}
          onPress={col.sortable ? () => handleSort(col.key) : undefined}
          disabled={!col.sortable}>
          <Text style={styles.headerText} numberOfLines={1}>
            {col.header}
          </Text>
          {col.sortable && sortKey === col.key && (
            <Ionicons
              name={sortAsc ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={theme.colors.primary}
              style={{ marginLeft: 2 }}
            />
          )}
        </Pressable>
      ))}
    </View>
  );

  const renderRow = ({ item, index }: { item: T; index: number }) => (
    <Pressable
      style={({ pressed }) => [
        styles.dataRow,
        index % 2 === 1 && styles.dataRowAlt,
        pressed && onRowPress && styles.dataRowPressed,
      ]}
      onPress={onRowPress ? () => onRowPress(item) : undefined}
      disabled={!onRowPress}>
      {columns.map(col => (
        <View
          key={col.key}
          style={[styles.dataCell, col.width ? { width: col.width } : { flex: 1 }]}>
          {col.render ? (
            col.render(item, index)
          ) : (
            <Text style={styles.dataCellText} numberOfLines={1}>
              {String((item as any)[col.key] ?? '-')}
            </Text>
          )}
        </View>
      ))}
    </Pressable>
  );

  if (sortedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={emptyIcon} size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableWrapper}>
          {renderHeader()}
          <FlatList
            data={sortedData}
            renderItem={renderRow}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    tableWrapper: {
      minWidth: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    headerCell: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    headerText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dataRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    dataRowAlt: {
      backgroundColor: theme.colors.surfaceSecondary + '80',
    },
    dataRowPressed: {
      backgroundColor: theme.colors.pressed,
    },
    dataCell: {
      paddingHorizontal: theme.spacing.xs,
      justifyContent: 'center',
    },
    dataCellText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
    },
  });

export default DataTable;
